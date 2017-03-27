// import {TweenLite, Power2} from "gsap";

// var stardata = require('../../data/stardata.json')
var fields = ['x','y','z','vx','vy','vz','absmag','temp','radius','id']; // all float32s
var stardata = require('../../assets/data/stardata.json');
var colorTable = require('../colorTable.json');
/* globals AFRAME THREE */

const STARFIELD_DIRTY = 'STARFIELD_DIRTY';
const STARFIELD_READY = 'STARFIELD_READY';
const STARFIELD_BUILDING = 'STARFIELD_BUILDING';
const STARFIELD_SCALING = 'STARFIELD_SCALING';
const STARFIELD_DETAIL_VIEW = 'STARFIELD_DETAIL_VIEW';

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
    state: { type: 'string', default: STARFIELD_DIRTY },
    time: { type: 'float', default: 0.0},
    selectedStar: { type: 'int', default: -1}
  },

  init: function () {
    var el = this.el;
    this.starDB = this.el.starDB = [];
    this.starIdLookup = {};

    this.detailView = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.detailView);

    this.starfieldMat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "starDecal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/star-decal.png" ) },
          "sphereMask": { type: "t", value: new THREE.TextureLoader().load( "assets/images/sphere-mask.png" ) },
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
    this.starLocations = [];
    this.spatialHash = {};
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

    this.tws = {
      val: 1
    }

    this.scaleParent = document.getElementById('star-detail-parent').object3D;
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
          } else {
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
    var h = this.getHashKey(pos);
    if(this.spatialHash[h] === undefined) {
      this.spatialHash[h] = [];
    }
    this.spatialHash[h].push(idx);
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

  updateGeometry(buf, offset, count) {
      if(this.offsetsProcessed.indexOf(offset) === -1) {
        if(buf.length !== count) {
          console.log("Invalid packet, rejecting");
        }
        this.offsetsProcessed.push(offset);
        var _buf = buf;
        var _offset = offset / 4;
        var _count = count / 4;

        let ar = new Float32Array(buf.buffer);

        this.posAttribute.array.set(ar, _offset);

        this.starCount += count/12;
        this.bufferOffset += (buf.length);
      }

  },

  buildStarfieldGeometry: function() {

    console.log(`Processing ${this.stardataraw.byteLength} bytes of stardata...`);

    var starCount = this.stardata.length / fields.length;
    var geo = new THREE.BufferGeometry();
    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var temp = new Float32Array(starCount);
    var color = new Float32Array(starCount * 4);
    var starScale = new Float32Array(starCount);
    var velocity = new Float32Array(starCount * 3);
    var radius = new Float32Array(starCount);
    var id = new Float32Array(starCount);

    let p = {};
    let v = {};

    // create buffers for each of the data fields packed into our bin file
    for(var i = 0; i < starCount; i++) {
      let starRec = {};
      // construct GPU buffers for each value
      p.x = verts[(i * 3) + 0] = this.stardata[(i * fields.length) + 0];
      p.y = verts[(i * 3) + 1] = this.stardata[(i * fields.length) + 1];
      p.z = verts[(i * 3) + 2] = this.stardata[(i * fields.length) + 2];

      if(i === 0) {
        p.x = verts[(i * 3) + 0] = 0.0;
        p.y = verts[(i * 3) + 1] = 0.0;
        p.z = verts[(i * 3) + 2] = 0.0;
      }

      v.x = velocity[(i * 3) + 0] = this.stardata[(i * fields.length) + 3];
      v.y = velocity[(i * 3) + 1] = this.stardata[(i * fields.length) + 4];
      v.z = velocity[(i * 3) + 2] = this.stardata[(i * fields.length) + 5];


      absmag[i] = this.stardata[(i * fields.length) + 6];
      temp[i] = this.stardata[(i * fields.length) + 7];

      // precalculate the color of the star based on its temperature
      let c = this.getColorForTemp(this.stardata[(i * fields.length) + 7]).multiplyScalar(1.15)
      color[(i * 4) + 0] = c.x;
      color[(i * 4) + 1] = c.y;
      color[(i * 4) + 2] = c.z;
      color[(i * 4) + 3] = c.w;

      radius[i] = this.stardata[(i * fields.length) + 8];
      id[i] = this.stardata[(i * fields.length) + 9];

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
      this.addStarToHash(p, i);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(Object.assign({}, starRec));
      this.starIdLookup[id[i]] = i;
    }

    geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    geo.addAttribute( 'velocity', new THREE.BufferAttribute(velocity, 3) );
    geo.addAttribute( 'absmag', new THREE.BufferAttribute(absmag, 1) );
    geo.addAttribute( 'temp', new THREE.BufferAttribute(temp, 1) );
    geo.addAttribute( 'starColor', new THREE.BufferAttribute(color, 4) );
    geo.addAttribute( 'starScale', new THREE.BufferAttribute(starScale, 1) );
    geo.addAttribute( 'radius', new THREE.BufferAttribute(radius, 1) );

    this.geo = geo;
    window.sel = this.el;
  },

  setScaleParentToStar: function(id) {
    let s = this.getStarWorldLocation(id);
    this.scaleParent.position.set(s.x, s.y, s.z);
    this.scaleParent.scale.set(1, 1, 1);
    this.scaleParent.updateMatrixWorld();
    // debugger;
    THREE.SceneUtils.attach(this.el.object3D, this.el.sceneEl.object3D, this.scaleParent);
    var scale = { v: 1 };
    this.tween = new AFRAME.TWEEN.Tween(scale)
                  .to({ v: 1e6 }, 1000)
                  .easing(AFRAME.TWEEN.Easing.Quintic.InOut)
                  .onUpdate( () => {
                    this.scaleParent.scale.set(scale.v, scale.v, scale.v);
                  })
                  .start();
  },
  clearScaleParent: function() {
    console.log('clear!')
    var scale = { v: this.scaleParent.scale.x };

    this.tween.stop();
    this.tween = new AFRAME.TWEEN.Tween(scale)
                  .to({ v: 1.0 }, 1000)
                  .easing(AFRAME.TWEEN.Easing.Quintic.InOut)
                  .onUpdate( () => {
                    console.log('updating')
                    this.scaleParent.scale.set(scale.v, scale.v, scale.v);
                  })
                  .onComplete( () => {
                    this.scaleParent.updateMatrixWorld();
                    THREE.SceneUtils.detach(this.el.object3D, this.scaleParent, this.el.sceneEl.object3D);
                    console.log('done 🐬');
                  })
                  .start();
  },

  update: function (oldData) {
    switch(this.data.state) {

      case STARFIELD_DIRTY:
        this.el.setAttribute('starfield', { state: STARFIELD_BUILDING });
        fetch('./assets/data/stardata.bin')
          .then( (res) => {
            return res.arrayBuffer();
          })
          .then( b => {
            this.stardataraw = b;
            this.stardata = new Float32Array(b);
            this.buildStarfieldGeometry();

            var mesh = new THREE.Object3D();
            console.log('building mesh');

            let m = new THREE.Points(this.geo, this.starfieldMat);
            mesh.add(m);
            this.el.setObject3D('mesh', mesh);
            this.el.setAttribute('starfield', { state: STARFIELD_READY });
            window.store = this.el.sceneEl.systems.redux.store;
            this.el.sceneEl.systems.redux.store.dispatch({
              type: 'STARFIELD_READY'
            })
          });
        break;

      case STARFIELD_READY:
        // if(this.data.scale !== oldData.scale) {
        //   this.tws.val = this.data.scale;
        //   this.el.setAttribute('starfield', { state: STARFIELD_SCALING });
        // }
        if(this.data.selectedStar !== oldData.selectedStar) {
         if(this.data.selectedStar >= 0) {
            console.log(`star changed from ${oldData.selectedStar} to ${this.data.selectedStar}`);
            this.setScaleParentToStar(this.data.selectedStar);
          } else {
            this.clearScaleParent();
          }
        }
        break;

      case STARFIELD_BUILDING:
        break;

      case STARFIELD_SCALING:
        break;

      case STARFIELD_DETAIL_VIEW:
        break;
    }
  },
  tick: function(time, delta) {
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
