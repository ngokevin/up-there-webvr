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
    dataDownloaded: { type: 'bool', default: false}
  },

  init: function () {
    var el = this.el;
    this.starDB = this.el.starDB = [];
    this.starIdLookup = {};
    this.starCount = 0
    this.detailView = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.detailView);
    this.starnamesEl = document.getElementById('starNames');
    if(this.starnamesEl.hasLoaded) {
      this.starnames = JSON.parse(THREE.Cache.files[this.starnamesEl.getAttribute('src')]);
    } else {
      this.starnamesEl.addEventListener('loaded', (evt) => {
        this.starnames = JSON.parse(THREE.Cache.files[this.starnamesEl.getAttribute('src')]);
      })
    }

    this.starfieldMat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "starDecal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/star-decal.png" ) },
          "starGlare": { type: "t", value: new THREE.TextureLoader().load( "assets/images/lensflare4.jpg" ) },
          "sphereMask": { type: "t", value: new THREE.TextureLoader().load( "assets/images/sphere-mask.png" ) },
          "starfieldScale": { type: "f", value: this.el.getAttribute('scale').x },
          "uTime": { type: "f", value: 0.1 },
          "uStarfieldTime": { type: "f", value: 0.0 },
          "uDetailDrawDistance": { type: "f", value: 15.0 }
        },
        vertexShader: require('../glsl/starfield.vert'),
        fragmentShader: require('../glsl/starfield.frag'),
        // depthTest: false,
        // depthWrite: false,
        transparent: true
      });

    this.tick = this.tick.bind(this);
    this.totalStarCount = 107643;
    this.starLocations = [];
    this.spatialHash = {};
    window.hash = this.spatialHash;
    this.hashResolution = 1.0;
    this.hashSearchRadius = {
      x: 2,
      y: 2,
      z: 2
    };
    this.hashStep = this.hashResolution * this.hashSearchRadius;

    this.camera = document.getElementById('acamera');

    this.update = this.update.bind(this);

    this.getNearestStarPosition = this.getNearestStarPosition.bind(this);
    this.buildStarfieldGeometry = this.buildStarfieldGeometry.bind(this);
    this.getStarWorldLocation = this.getStarWorldLocation.bind(this);

    this.el.getStarData = this.getStarData.bind(this);
    this.el.getNearestStarId = this.getNearestStarId.bind(this);
    this.el.getNearestStarWorldLocation = this.getNearestStarWorldLocation.bind(this);

    this.getHashKeyMemo = memoize(this.getHashKey.bind(this));
    this.dataFields = ['x','y','z','vx','vy','vz','mag','temp','radius','id'];
    this.tws = {
      val: 1
    }
    this.spawnedStars = 0;
    this.scaleParent = document.getElementById('star-detail-parent').object3D;
    this.starDataQueue = [];
    this.processStarData = this.processStarData.bind(this);

    this.spawnLimit = 0;
    this.rebuildCheckSteps = 10000;

    // this.scaleParent.name = "ScaleParent";
    // this.el.sceneEl.object3D.add(this.scaleParent);

  },

  getHashKey: function(pos) {
    return `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
  },

  getStarsNearLocation: function(pos) {

    var list = []
      , hashKeys = []
      , h = '';

    for(var x = pos.x - (this.hashResolution * this.hashSearchRadius.x); x <= pos.x + (this.hashResolution * this.hashSearchRadius.x); x += this.hashResolution) {
      for(var y = pos.y - (this.hashResolution * this.hashSearchRadius.y); y <= pos.y + (this.hashResolution * this.hashSearchRadius.y); y += this.hashResolution) {
        for(var z = pos.z - (this.hashResolution * this.hashSearchRadius.z); z <= pos.z + (this.hashResolution * this.hashSearchRadius.z); z += this.hashResolution) {
          let p = { x: x, y: y, z: z };
          h = this.getHashKey(p);
          if(hashKeys.indexOf(p) === -1) {
            hashKeys.push(p);
            if(this.spatialHash[h] !== undefined) {
              list = list.concat(this.spatialHash[h]);
            }
          }
        }
      }
    }

    return list;
  },

  getStarsInRadius: function(pos, radius) {

    var list = []
      , hashKeys = []
      , h = '';

    for(var x = pos.x - (this.hashResolution * radius); x <= pos.x + (this.hashResolution * radius); x += this.hashResolution) {
      for(var y = pos.y - (this.hashResolution * radius); y <= pos.y + (this.hashResolution * radius); y += this.hashResolution) {
        for(var z = pos.z - (this.hashResolution * radius); z <= pos.z + (this.hashResolution * radius); z += this.hashResolution) {
          let p = { x: x, y: y, z: z };
          h = this.getHashKey(p);
          if(hashKeys.indexOf(p) === -1) {
            hashKeys.push(p);
            if(this.spatialHash[h] !== undefined) {
              // console.log(`Hash key ${h}: ${this.spatialHash[h].length} items`)
              list = list.concat(this.spatialHash[h]);
              // console.log(list);
              // console.log(list.length)
            }
          } else {
            // console.log(`dupe! ${h}`)
          }

        }
      }
    }

    return list;
  },

  addStarToHash: function(pos, idx) {
    let h = this.getHashKey(pos);
    if(this.spatialHash[h] === undefined) {
      this.spatialHash[h] = [];
    }
    this.spatialHash[h].push(idx);
    return h
  },

  getStarData: function(id) {
    return this.starDB[id];
  },

  getStarPosition: function(id) {
    return this.starLocations[id];
  },

  getStarPositionVec3: function(id) {
    // console.log(id);
    let p = this.getStarPosition(id);
    return new THREE.Vector3(p.x, p.y, p.z);
  },

  getStarWorldLocation: function(id) {
    let p = this.getStarPosition(id);
    return this.el.object3D.localToWorld(new THREE.Vector3(p.x, p.y, p.z));
  },

  getStarsNearWorldLocation: function(pos, radius = 2) {
    return [...new Set(this.getStarsInRadius(this.el.object3D.worldToLocal(pos), radius))];
  },

  getNearestStarPosition: function(pos) {
    let p = this.el.object3D.worldToLocal(pos);
    let s = this.getStarsNearLocation(p);
    if(s.length > 0) {
      var p1 = new THREE.Vector3(p.x, p.y, p.z);
      var p2 = new THREE.Vector3();
      let x = s.sort( (a,b) => {
        let ap = this.getStarPosition(a);
        let bp = this.getStarPosition(b);
        let da = p2.set(ap.x, ap.y, ap.z).distanceTo(p1);
        let db = p2.set(bp.x, bp.y, bp.z).distanceTo(p1);
        if(da < db) {
          return -1;
        } else if(da > db) {
          return 1;
        }
        return 0;
      });
      return { id: x[0], pos: this.getStarPosition(x[0]) };
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

  getColorForTemp: function(temp) {
    let tempRound = Math.floor((temp/100))*100;
    tempRound = Math.max(1000, Math.min(40000, tempRound));
    let i = Math.floor(tempRound/100) - 10;
      // console.log(i);
    let c = colorTable[i];

    return new THREE.Vector4(c[1], c[2], c[3], 1.0);
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

  processUpdateBatch() {
    if(!this.updateQueue.length) return false;

    var c = 0
      , q;

    var sortedBatches = this.updateQueue.sort( (q) => {
      return -q.id;
    })

    var lastId = sortedBatches[0].id;
    var o = sortedBatches[0].offset;
    while((q = sortedBatches.shift()) !== undefined) {
      if(q.id - lastId > 1) {
        break;
      }
      c += q.count;
      this.updateGeometry(q.buf, q.offset, q.count);
    }
    // console.log(`Updated ${c} stars`)

    if(c > 0) {
      this.posAttribute.updateRange.count = c/4;
      this.posAttribute.updateRange.offset = o/4;
      // console.log(this.posAttribute.updateRange);
      this.posAttribute.needsUpdate = true;
    }

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

    window.geo = geo;
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

    // geo.attributes.position.setDynamic(true);

    this.geo = geo;
    this.points = new THREE.Points(this.geo, this.starfieldMat);
    this.points.name = "starfieldPoints";
    this.points.frustrumCulled = false;
    // this.el.object3D.frustrumCulled = false;
    this.el.setObject3D('mesh', this.points);

    this.macroPosition = new THREE.Vector3();
    this.detailPosition = new THREE.Vector3();
    this.detailDistance = 4.0;
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

  splitPackets: function(packets, maxSize) {

    let splitBuffers = [];

    packets.map( starBuffer => {
      let buff = starBuffer.buf;
      let fields = this.dataFields;
      let starOffset = (starBuffer.offset / 4) / fields.length;
      let starCount = (starBuffer.count / 4) / fields.length;
      let bytesPerStar = 4 * fields.length;

      // in chunks of maxSize items, iterate until we're out of stars
      for(let i = 0; i < starCount; i += maxSize) {

        let b
          , a;

        if(i+maxSize >= starCount) {
          b = Buffer.from(buff, (i*bytesPerStar), (starCount*bytesPerStar) - (i*bytesPerStar))
          a = new Float32Array(buff.buffer, (i*bytesPerStar), (starCount*fields.length) - (i*fields.length))
        } else {
          // b = buff.slice(starBuffer.offset + (i*bytesPerStar), maxSize*bytesPerStar);
          b = Buffer.from(buff, (i*bytesPerStar), maxSize*bytesPerStar)
          a = new Float32Array(buff.buffer, (i*bytesPerStar), maxSize*fields.length)
        }

        splitBuffers.push({
          buf: b,
          arr: a,
          offset: starBuffer.offset + (i*bytesPerStar),
          count: b.length
        });

      }
    })

    return splitBuffers;
  },

  processStarData: function() {

    let starBuffer = this.starDataQueue.shift();

    if(starBuffer === undefined) return;


    // console.log('building...', starBuffer)
    // create a few temp objects to use
    let p = {};
    let v = {};
    let starRec = {};

    let buff = starBuffer.buf;
    let fields = this.dataFields;
    let offset = (starBuffer.offset / 4) / fields.length;
    // var ar = new Float32Array(buff.buffer);
    var ar = starBuffer.arr;

    var starCount = ar.length / fields.length;

    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var temp = new Float32Array(starCount);
    var color = new Float32Array(starCount * 4);
    var starScale = new Float32Array(starCount);
    var velocity = new Float32Array(starCount * 3);
    var radius = new Float32Array(starCount);
    var id = new Float32Array(starCount);

    // for each star in the buffer
    for(var i = 0; i < starCount; i++) {

      // construct GPU buffers for each value
      p.x = verts[(i * 3) + 0] = ar[(i * fields.length) + 0];
      p.y = verts[(i * 3) + 1] = ar[(i * fields.length) + 1];
      p.z = verts[(i * 3) + 2] = ar[(i * fields.length) + 2];

      if(starCount === 0) {
        p.x = verts[(i * 3) + 0] = 0.0;
        p.y = verts[(i * 3) + 1] = 0.0;
        p.z = verts[(i * 3) + 2] = 0.0;
      }

      v.x = velocity[(i * 3) + 0] = ar[(i * fields.length) + 3];
      v.y = velocity[(i * 3) + 1] = ar[(i * fields.length) + 4];
      v.z = velocity[(i * 3) + 2] = ar[(i * fields.length) + 5];

      absmag[i] = ar[(i * fields.length) + 6];
      temp[i] = ar[(i * fields.length) + 7];

      // precalculate the color of the star based on its temperature
      let c = this.getColorForTemp(ar[(i * fields.length) + 7])
      color[(i * 4) + 0] = c.x * 1.15;
      color[(i * 4) + 1] = c.y * 1.15;
      color[(i * 4) + 2] = c.z * 1.15;
      color[(i * 4) + 3] = c.w;

      radius[i] = ar[(i * fields.length) + 8];
      id[i] = ar[(i * fields.length) + 9];

      // precalculate the star scale offset based on its magnitude
      starScale[i] = Math.max(.5, Math.min(5.0, 7.0 * (1.0 - this.logScale(absmag[i]))));

      starRec.position = { x: p.x, y: p.y, z: p.z };
      starRec.mag = absmag[i];
      starRec.color = c;
      starRec.radius = radius[i];
      starRec.temp = temp[i];
      starRec.velocity = { x: v.x, y: v.y, z: v.z };
      starRec.id = id[i];

      // add the star to the local spatial hash for fast querying
      let shv = this.addStarToHash(p, this.spawnedStars);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(Object.assign({}, starRec));
      this.starIdLookup[id[i]] = 0 + this.spawnedStars;

      this.spawnedStars++;
    }

    this.geo.attributes.position.array.set(verts, offset * 3)
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.position.updateRange.count = verts.length;
    this.geo.attributes.position.updateRange.offset = offset * 3;
    //
    this.geo.attributes.absmag.array.set(absmag, offset)
    // this.geo.attributes.absmag.needsUpdate = true;
    // this.geo.attributes.absmag.updateRange.count = absmag.length;
    // this.geo.attributes.absmag.updateRange.offset = offset;
    //
    this.geo.attributes.temp.array.set(temp, offset)
    // this.geo.attributes.temp.needsUpdate = true;
    // this.geo.attributes.temp.updateRange.count = temp.length;
    // this.geo.attributes.temp.updateRange.offset = offset;
    //
    this.geo.attributes.starColor.array.set(color, offset * 4)
    this.geo.attributes.starColor.needsUpdate = true;
    this.geo.attributes.starColor.updateRange.count = color.length;
    this.geo.attributes.starColor.updateRange.offset = offset * 4;
    //
    this.geo.attributes.starScale.array.set(starScale, offset)
    this.geo.attributes.starScale.needsUpdate = true;
    this.geo.attributes.starScale.updateRange.count = starScale.length;
    this.geo.attributes.starScale.updateRange.offset = offset;
    //
    this.geo.attributes.velocity.array.set(velocity, offset * 3)
    // this.geo.attributes.velocity.needsUpdate = true;
    // this.geo.attributes.velocity.updateRange.count = velocity.length;
    // this.geo.attributes.velocity.updateRange.offset = offset * 3;
    //
    this.geo.attributes.radius.array.set(radius, offset)
    // this.geo.attributes.radius.needsUpdate = true;
    // this.geo.attributes.radius.updateRange.count = radius.length;
    // this.geo.attributes.radius.updateRange.offset = offset;

    if(this.geo.boundingSphere.radius < 1000) {
      this.geo.boundingSphere.radius = 1000;
    }

    if(this.spawnedStars > this.spawnLimit) {
      this.updateGeometryAttributes();
      this.spawnLimit += this.rebuildCheckSteps;
    }
    // this.geo.computeBoundingSphere();

    window.geo = this.geo;

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

    switch(this.data.state) {

      case STARFIELD_NEW:

        return;
        break;

      case STARFIELD_BUILDING:
        break;

      case STARFIELD_DIRTY:
        this.el.setAttribute('starfield', { state: STARFIELD_BUILDING });
        break;

      case STARFIELD_READY:

        if(this.data.selectedStar !== oldData.selectedStar) {
         if(this.data.selectedStar >= 0) {
            setTimeout( () => {
              this.setScaleParentToStar(this.data.selectedStar);
            }, 100)
          } else {
            this.clearScaleParent(oldData.selectedStar);
          }
        }
        break;


      case STARFIELD_SCALING:
        break;

      case STARFIELD_DETAIL_VIEW:
        break;
    }
  },
  tick: function(time, delta) {
    switch(this.el.getAttribute('starfield').state) {

      case STARFIELD_NEW:
        // create a store to stream download and process bytes from a binary file
        this.store = new HttpStore('./assets/data/stardata.bin', this.dataFields.length);

        // initialize the starfield geometry
        this.buildStarfieldGeometry();
        this.el.setAttribute('starfield', { state: STARFIELD_BUILDING });
        this.data.state = STARFIELD_BUILDING;
        console.log("Building starfield... ✨")
        return;
        break;

      case STARFIELD_BUILDING:

          let newStars = this.store.getPackets();

          if(newStars && newStars.length > 0) {
            // console.log("splitting stars", newStars);
            let sStars = this.splitPackets(newStars, 1024);
            this.starDataQueue = this.starDataQueue.concat(sStars);
          } else if(newStars === false) {
            this.el.setAttribute('starfield', { dataDownloaded: true });
          }

          this.processStarData();

          this.el.sceneEl.systems.redux.store.dispatch({
            type: 'STAR_COUNT',
            val: this.spawnedStars
          })

          // console.log(`Processed ${this.spawnedStars} stars 🐝`)

          if(this.data.dataDownloaded && this.starDataQueue.length == 0) {
            console.log(`Starfield ready. ${newStars} Processed ${this.spawnedStars} stars 🐝`)
            this.el.setAttribute('starfield', { state: STARFIELD_READY });
            this.el.emit('starfieldReady', true);
            this.updateGeometryAttributes();
            this.el.sceneEl.systems.redux.store.dispatch({
              type: 'SET_BUSY',
              val: false
            })
            setTimeout(() => {
              this.el.sceneEl.systems.redux.store.dispatch({
                type: 'STARFIELD_READY'
              })

            }, 5000);

          }

        break;

    }
    let p = this.camera.getAttribute('position');
    let s = this.el.getAttribute('scale').x;
    // if(this.data.state === STARFIELD_SCALING) {
    //   // this.scaleParent.scale.set(this.tws.val, this.tws.val, this.tws.val);
    //   this.el.setAttribute('scale', `${this.tws.val} ${this.tws.val} ${this.tws.val}`)
    //   this.starfieldMat.uniforms['starfieldScale'].value = this.tws.val;
    //   this.el.setAttribute('starfield', { state: STARFIELD_READY });
    // }
    this.starfieldMat.uniforms['starfieldScale'].value = this.tws.val;
    this.starfieldMat.uniforms['cameraPosition'].value = this.el.object3D.worldToLocal(new THREE.Vector3(p.x, p.y, p.z));
    this.starfieldMat.uniforms['uTime'].value = time;
    this.starfieldMat.uniforms['uStarfieldTime'].value = this.data.time;
  }
});
