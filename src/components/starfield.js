// import {TweenLite, Power2} from "gsap";
const SOLS_TO_PARSECS = 2.25461e-8
    , AU_TO_PARSEC = 4.84814e-6;

// var stardata = require('../../data/stardata.json')
var fields = ['x','y','z','vx','vy','vz','absmag','temp','radius','id']; // all float32s
var stardata = require('../../assets/data/stardata.json');
var colorTable = require('../colorTable.json');
var HttpStore = require('../HttpStore');
/* globals AFRAME THREE */

const STARFIELD_DIRTY = 'STARFIELD_DIRTY';
const STARFIELD_READY = 'STARFIELD_READY';
const STARFIELD_BUILDING = 'STARFIELD_BUILDING';
const STARFIELD_SCALING = 'STARFIELD_SCALING';
const STARFIELD_DETAIL_VIEW = 'STARFIELD_DETAIL_VIEW';
const STARFIELD_NEW = 'STARFIELD_NEW';

var memoize = function(fn) {
    var cache = {}
      , fn = fn;

    return function(arg) {
      if(arg in cache) {
        return cache[arg]
      } else {
        return cache[arg] = fn(arg);
      }
    }
}

AFRAME.registerComponent('starfield', {
  schema: {
    src: {type: 'asset'},
    scale: {type: 'float', default: 1.0},
    state: { type: 'string', default: STARFIELD_NEW },
    time: { type: 'float', default: 0.0},
    selectedStar: { type: 'int', default: -1},
    dataDownloaded: { type: 'bool', default: false},
    starDataState: { type: 'string', default: ''}
  },

  init: function () {
    var el = this.el;
    this.starCount = 0

    this.starfieldMat = new THREE.ShaderMaterial({
      uniforms: {
        "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
        "starDecal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/star-decal.png" ) },
        "starGlare": { type: "t", value: new THREE.TextureLoader().load( "assets/images/lensflare4.jpg" ) },
        "sphereMask": { type: "t", value: new THREE.TextureLoader().load( "assets/images/star-decal.png" ) },
        "starfieldScale": { type: "f", value: this.el.getAttribute('scale').x },
        "uTime": { type: "f", value: 0.1 },
        "uStarfieldTime": { type: "f", value: 0.0 },
        "uDetailDrawDistance": { type: "f", value: 15.0 }
      },
      vertexShader: require('../glsl/starfield.vert'),
      fragmentShader: require('../glsl/starfield.frag'),
      transparent: true
    });

    this.tick = this.tick.bind(this);
    this.totalStarCount = 107643;

    this.camera = document.getElementById('acamera');

    this.update = this.update.bind(this);

    this.dataFields = ['x','y','z','vx','vy','vz','mag','temp','radius','id'];

    // temp var used for tweening
    this.tws = {
      val: 1
    }

    this.spawnedStars = 0;
    this.scaleParent = document.getElementById('star-detail-parent').object3D;
    this.stardata = this.el.sceneEl.systems['star-data'];
    this.geometryReady = false;
    this.starsPerFrame = 500;

    // create a set of arrays once and overwrite, no need to instantiate
    // new arrays every frame
    this.starPackBuffer = {
      verts: new Float32Array(this.starsPerFrame * 3),
      absmag: new Float32Array(this.starsPerFrame),
      temp: new Float32Array(this.starsPerFrame),
      color: new Float32Array(this.starsPerFrame * 4),
      starScale: new Float32Array(this.starsPerFrame),
      velocity: new Float32Array(this.starsPerFrame * 3),
      radius: new Float32Array(this.starsPerFrame),
      id: new Float32Array(this.starsPerFrame)
    }

  },

  getHashKey: function(pos) {
    return this.stardata.getHashKey(pos);
  },

  getStarsNearLocation: function(pos) {
    return this.stardata.getStarsNearLocation(pos);
  },

  getStarData: function(id) {
    return this.stardata.starDB[id];
  },

  getStarPositionVec3: function(id) {
    // console.log(id);
    let p = this.stardata.getStarPosition(id);
    return new THREE.Vector3(p.x, p.y, p.z);
  },

  getStarWorldLocation: function(id) {
    let p = this.stardata.getStarPosition(id);
    return this.el.object3D.localToWorld(new THREE.Vector3(p.x, p.y, p.z));
  },

  getStarsNearWorldLocation: function(pos, radius = 2) {
    return [...new Set(this.stardata.getStarsInRadius(this.el.object3D.worldToLocal(pos), radius))];
  },

  // calculates the location of the nearest star to the world position
  getNearestStarPosition: function(pos) {
    let p = this.el.object3D.worldToLocal(pos);
    let s = this.stardata.getStarsNearLocation(p);
    if(s.length > 0) {
      var p1 = new THREE.Vector3(p.x, p.y, p.z);
      var p2 = new THREE.Vector3();
      let x = s.sort( (a,b) => {
        let ap = this.stardata.getStarPosition(a);
        let bp = this.stardata.getStarPosition(b);
        let da = p2.set(ap.x, ap.y, ap.z).distanceTo(p1);
        let db = p2.set(bp.x, bp.y, bp.z).distanceTo(p1);
        if(da < db) {
          return -1;
        } else if(da > db) {
          return 1;
        }
        return 0;
      });
      return { id: x[0], pos: this.stardata.getStarPosition(x[0]) };
    } else {
      return false;
    }
  },

  getNearestStarWorldLocation: function(pos) {
    let p = this.getNearestStarPosition(pos);
    if(p) {
      return { id: p.id, pos: this.el.object3D.localToWorld(new THREE.Vector3(p.pos.x, p.pos.y, p.pos.z)) };
    } else {
      return false;
    }
  },

  getNearestStarId: function(pos) {
    let p = this.getNearestStarPosition(pos);
    if(p) {
      return p.id;
    } else {
      return -1;
    }
  },

  logScale: function(value) {
    function handleLog(x, b) {
      return Math.log(Math.max(x, 0.0)) / Math.log(Math.max(b, 0.0));
    }

    function scaleLog(base, value, min, max) {
      return handleLog(value - min, base) / handleLog(max - min, base);
    }

    return scaleLog(10, value, -1.77, 12);
  },

  maskStar: function(id, mask) {
    // debugger;
    let o = this.el.object3D.getObjectByName('starfieldPoints', true);

    o.geometry.attributes.starColor.setW(id, parseFloat(mask));
    o.geometry.attributes.starColor.needsUpdate = true;
  },

  buildStarfieldGeometry: function() {

    var starCount = this.totalStarCount;
    var geo = new THREE.BufferGeometry();

    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var temp = new Float32Array(starCount);
    var color = new Float32Array(starCount * 4);
    var starScale = new Float32Array(starCount);
    var velocity = new Float32Array(starCount * 3);
    var radius = new Float32Array(starCount);
    var id = new Float32Array(starCount);

    geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    geo.addAttribute( 'velocity', new THREE.BufferAttribute(velocity, 3) );
    geo.addAttribute( 'absmag', new THREE.BufferAttribute(absmag, 1) );
    geo.addAttribute( 'temp', new THREE.BufferAttribute(temp, 1) );
    geo.addAttribute( 'starColor', new THREE.BufferAttribute(color, 4) );
    geo.addAttribute( 'starScale', new THREE.BufferAttribute(starScale, 1) );
    geo.addAttribute( 'radius', new THREE.BufferAttribute(radius, 1) );


    this.geo = geo;
    this.points = new THREE.Points(this.geo, this.starfieldMat);
    this.points.name = "starfieldPoints";
    this.points.frustrumCulled = false;
    // this.el.object3D.frustrumCulled = false;
    this.el.setObject3D('mesh', this.points);

    this.macroPosition = new THREE.Vector3();
    this.detailPosition = new THREE.Vector3();
    this.detailDistance = 4.0;

    this.geometryReady = true;
    // this.el.object3D.frustrumCulled = false;
  },

  // scale the starfield to show the selected star at the proper scale
  setScaleParentToStar: function(id) {
    let s = this.getStarWorldLocation(id);
    this.scaleParent.position.set(s.x, s.y, s.z);
    this.scaleParent.scale.set(1, 1, 1);
    let l = performance.now()
    this.scaleParent.updateMatrixWorld();
    l = performance.now() - l;
    console.log(`Parent calculation: ${l}`)
    // parent the starfield to the scaleParent location without changing its world transform
    THREE.SceneUtils.attach(this.el.object3D, this.el.sceneEl.object3D, this.scaleParent);
    var scale = { v: 1 };
    this.maskStar(id, 0.0);
    let stardata = this.getStarData(id);

    // save current starfield world position to tween back to
    this.macroPosition.copy(this.scaleParent.position);

    // calculate destination position some distance away from the camera
    let d = new THREE.Vector3(0, 0, 1);
    d.applyQuaternion(this.camera.object3D.quaternion);
    this.detailPosition.copy(this.camera.object3D.position).sub(d.multiplyScalar(this.detailDistance));

    // tween the position to be the right distance away from wherever the camera is currently gazing
    this.posTween = new AFRAME.TWEEN.Tween(this.scaleParent.position)
                      .to(
                        {
                          x: this.detailPosition.x,
                          y: this.detailPosition.y,
                          z: this.detailPosition.z
                        }, 1000)
                        .easing(AFRAME.TWEEN.Easing.Exponential.InOut)
                        .start();

    let starDetails = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails;

    parsecsScale = SOLS_TO_PARSECS * stardata.radius;

    // scale the parent so that the star will always be 1m in radius
    let parentScale = 0.5 / parsecsScale;

    // tween the scale so that the star's radius in sols is
    this.tween = new AFRAME.TWEEN.Tween(scale)
                  .to({ v: parentScale }, 1000)
                  .easing(AFRAME.TWEEN.Easing.Quintic.InOut)
                  .onUpdate( () => {
                    this.scaleParent.scale.set(scale.v, scale.v, scale.v);
                  })
                  .start();
  },
  clearScaleParent: function(id) {
    var scale = { v: this.scaleParent.scale.x };

    // tween the scaleparent position back to our previous location
    this.posTween.stop();
    this.posTween = new AFRAME.TWEEN.Tween(this.scaleParent.position)
                      .to(
                        {
                          x: this.macroPosition.x,
                          y: this.macroPosition.y,
                          z: this.macroPosition.z
                        }, 1000)
                        .easing(AFRAME.TWEEN.Easing.Exponential.InOut)
                        .start();

    // tween the scaleparent scale back to 1
    this.tween.stop();
    this.tween = new AFRAME.TWEEN.Tween(scale)
                  .to({ v: 1.0 }, 1000)
                  .easing(AFRAME.TWEEN.Easing.Quintic.Out)
                  .onUpdate( () => {
                    // console.log('updating')
                    this.scaleParent.scale.set(scale.v, scale.v, scale.v);
                  })
                  .onComplete( () => {
                    let l = performance.now()
                    this.scaleParent.updateMatrixWorld();
                    l = performance.now() - l;
                    console.log(`Detachment: ${l}`)
                    // this.scaleParent.updateMatrixWorld();
                    this.maskStar(id, 1.0);
                    THREE.SceneUtils.detach(this.el.object3D, this.scaleParent, this.el.sceneEl.object3D);
                    console.log('done 🦑');
                  })
                  .start();
  },

  processStarData: function() {

    if(this.starCount >= this.stardata.starDB.length) return true;

    // convenience vars
    let verts = this.starPackBuffer.verts;
    let absmag = this.starPackBuffer.absmag;
    let temp = this.starPackBuffer.temp;
    let color = this.starPackBuffer.color;
    let starScale = this.starPackBuffer.starScale;
    let velocity = this.starPackBuffer.velocity;
    let radius = this.starPackBuffer.radius;
    let id = this.starPackBuffer.id;

    // update the arrays with values for each star in the buffer
    for(var i = 0; i < this.starsPerFrame; i++) {

      // pull the next star record from the db
      let star = this.stardata.starDB[this.starCount++];

      if(star === undefined) break;

      // construct GPU buffers for each value
      verts[(i * 3) + 0] = star.position.x;
      verts[(i * 3) + 1] = star.position.y;
      verts[(i * 3) + 2] = star.position.z;

      if(star.id === 0) {
        verts[(i * 3) + 0] = 0.0;
        verts[(i * 3) + 1] = 0.0;
        verts[(i * 3) + 2] = 0.0;
      }

      velocity[(i * 3) + 0] = star.position.x;
      velocity[(i * 3) + 1] = star.position.y;
      velocity[(i * 3) + 2] = star.position.z;

      absmag[i] = star.mag;
      temp[i] = star.temp;

      // precalculate the color of the star based on its temperature
      color[(i * 4) + 0] = star.color.x
      color[(i * 4) + 1] = star.color.y
      color[(i * 4) + 2] = star.color.z
      color[(i * 4) + 3] = star.color.w

      radius[i] = star.radius
      id[i] = star.id

      // precalculate the star scale offset based on its magnitude
      starScale[i] = Math.max(.5, Math.min(5.0, 7.0 * (1.0 - this.logScale(absmag[i]))));

      this.spawnedStars++;
    }

    let offset = this.spawnedStars - i;

    // if it's the last frame, slice empty stars off each array before sending to the gpu
    if(i < this.starsPerFrame) {
      verts = verts.slice(0, i * 3);
      absmag = absmag.slice(0, i);
      temp = temp.slice(0, i);
      color = color.slice(0, i * 4);
      starScale = starScale.slice(0, i);
      velocity = velocity.slice(0, i * 3);
      radius = radius.slice(0, i);
      id = id.slice(0, i);
    }

    this.geo.attributes.position.array.set(verts, offset * 3)
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.position.updateRange.count = verts.length;
    this.geo.attributes.position.updateRange.offset = offset * 3;

    this.geo.attributes.absmag.array.set(absmag, offset)
    this.geo.attributes.temp.array.set(temp, offset)

    this.geo.attributes.starColor.array.set(color, offset * 4)
    this.geo.attributes.starColor.needsUpdate = true;
    this.geo.attributes.starColor.updateRange.count = color.length;
    this.geo.attributes.starColor.updateRange.offset = offset * 4;

    this.geo.attributes.starScale.array.set(starScale, offset)
    this.geo.attributes.starScale.needsUpdate = true;
    this.geo.attributes.starScale.updateRange.count = starScale.length;
    this.geo.attributes.starScale.updateRange.offset = offset;

    this.geo.attributes.velocity.array.set(velocity, offset * 3)



    this.geo.attributes.radius.array.set(radius, offset)

    if(this.geo.boundingSphere.radius < 1000) {
      this.geo.boundingSphere.radius = 1000;
    }

    if(this.spawnedStars > this.spawnLimit) {
      this.updateGeometryAttributes();
      this.spawnLimit += this.rebuildCheckSteps;
    }

    this.geometryReady = true;
    return false;
  },

  updateGeometryAttributes: function() {
    Object.keys(this.geo.attributes).map( k => {
      this.geo.attributes[k].needsUpdate = true;
      this.geo.attributes[k].updateRange.offset = 0;
      this.geo.attributes[k].updateRange.count = this.geo.attributes[k].array.length;
    })
    // this.geo.computeBoundingSphere();
  },

  update: function (oldData) {
    if(this.data.starDataState !== oldData.starDataState) {
      console.log(this.data.starDataState);
    }
    //
    // switch(this.data.state) {
    //
    //   case STARFIELD_NEW:
    //
    //     return;
    //     break;
    //
    //   case STARFIELD_BUILDING:
    //     break;
    //
    //   case STARFIELD_DIRTY:
    //     this.el.setAttribute('starfield', { state: STARFIELD_BUILDING });
    //     break;
    //
    //   case STARFIELD_READY:
    //
    //     if(this.data.selectedStar !== oldData.selectedStar) {
    //      if(this.data.selectedStar >= 0) {
    //         setTimeout( () => {
    //           this.setScaleParentToStar(this.data.selectedStar);
    //         }, 100)
    //       } else {
    //         this.clearScaleParent(oldData.selectedStar);
    //       }
    //     }
    //     break;
    //
    //
    //   case STARFIELD_SCALING:
    //     break;
    //
    //   case STARFIELD_DETAIL_VIEW:
    //     break;
    // }
  },
  tick: function(time, delta) {
    switch(this.el.getAttribute('starfield').state) {

      case STARFIELD_NEW:
        // initialize the starfield geometry
        // this.buildStarfieldGeometry();
        this.el.setAttribute('starfield', { state: STARFIELD_BUILDING });
        this.data.state = STARFIELD_BUILDING;
        console.log("Building starfield... ✨")
        return;
        break;

      case STARFIELD_BUILDING:

        if(this.data.starDataState !== 'STARDATA_READY') return;

        if(!this.geometryReady) {
          console.log("Initializing Geometry... ✨")
          this.buildStarfieldGeometry();
          return;
        }

        let res = this.processStarData();

        this.el.sceneEl.systems.redux.store.dispatch({
          type: 'STAR_COUNT',
          val: this.spawnedStars
        })

        if(res) {
          console.log(`🐝 Starfield ready. Processed ${this.spawnedStars} stars.`)
          this.el.setAttribute('starfield', { state: STARFIELD_READY });
          this.el.emit('starfieldReady', true);
          this.updateGeometryAttributes();

          this.el.sceneEl.systems.redux.store.dispatch({
            type: 'STARFIELD_READY'
          })
        }

        break;

    }
    let p = this.camera.getAttribute('position');
    let s = this.el.getAttribute('scale').x;

    this.starfieldMat.uniforms['starfieldScale'].value = this.tws.val;
    this.starfieldMat.uniforms['cameraPosition'].value = this.el.object3D.worldToLocal(new THREE.Vector3(p.x, p.y, p.z));
    this.starfieldMat.uniforms['uTime'].value = time;
    this.starfieldMat.uniforms['uStarfieldTime'].value = this.data.time;
  }
});
