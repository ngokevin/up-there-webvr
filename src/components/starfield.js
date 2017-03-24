import {TweenLite, Power2} from "gsap";

// var stardata = require('../../data/stardata.json')
var fields = ['x','y','z','vx','vy','vz','absmag','ci']; // all float32s
var stardata = require('../../assets/data/stardata.json');
var colorTable = require('../colorTable.json');
/* globals AFRAME THREE */

const STARFIELD_DIRTY = 'STARFIELD_DIRTY';
const STARFIELD_READY = 'STARFIELD_READY';
const STARFIELD_BUILDING = 'STARFIELD_BUILDING';
const STARFIELD_SCALING = 'STARFIELD_SCALING';

AFRAME.registerComponent('starfield', {
  schema: {
    src: {type: 'asset'},
    scale: {type: 'float', default: 1.0},
    state: { type: 'string', default: STARFIELD_DIRTY },
    time: { type: 'float', default: 0.0}
  },

  init: function () {
    var el = this.el;
    this.starDB = this.el.starDB = [];

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
        // depthWrite: false,
        // depthTest: false,
        transparent: true
      });

    this.tick = this.tick.bind(this);
    this.starLocations = [];
    this.spatialHash = {};
    this.hashResolution = 1.0;
    this.hashSearchRadius = 2;
    this.hashStep = this.hashResolution * this.hashSearchRadius;

    this.camera = document.getElementById('acamera');

    this.update = this.update.bind(this);

    this.getNearestStarPosition = this.getNearestStarPosition.bind(this);
    this.getStarWorldLocation = this.getStarWorldLocation.bind(this);
    this.el.getNearestStarId = this.getNearestStarId.bind(this);
    this.el.getNearestStarWorldLocation = this.getNearestStarWorldLocation.bind(this);

//    debugger;

    // this.animation = this.el.getElementsByTagName('a-animation')[0];
    // this.el.addEventListener('animationend', (evt) => {
    //   this.el.setAttribute('starfield', { state: STARFIELD_READY });
    // });

    this.tws = {
      val: 1
    }

    this.scaleParent = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.scaleParent);

  },

  getHashKey: function(pos) {
    return `${Math.floor(pos.x / this.hashResolution)}_${Math.floor(pos.y / this.hashResolution)}_${Math.floor(pos.z / this.hashResolution)}`;
  },

  getStarsNearLocation: function(pos) {

    let list = []
      , h = '';

    for(let x = pos.x - this.hashStep; x < pos.x + this.hashStep; x += this.hashStep) {
      for(let y = pos.y - this.hashStep; y < pos.y + this.hashStep; y += this.hashStep) {
        for(let z = pos.z - this.hashStep; z < pos.z + this.hashStep; z += this.hashStep) {
          h = this.getHashKey(pos);
          if(this.spatialHash[h] !== undefined) {
            list = list.concat(this.spatialHash[h]);
          }
        }
      }
    }
    // console.log(list);
    return list;
  },

  addStarToHash: function(pos, idx) {
    var h = this.getHashKey(pos);
    if(this.spatialHash[h] === undefined) {
      this.spatialHash[h] = [];
    }
    this.spatialHash[h].push(idx);
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

  buildStarfieldGeometry: function() {

    console.log(`Processing ${this.stardataraw.byteLength} bytes of stardata...`);

    var starCount = this.stardata.length / fields.length;
    console.log(starCount);
    var geo = new THREE.BufferGeometry();
    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var ci = new Float32Array(starCount);
    var color = new Float32Array(starCount * 4);
    var starScale = new Float32Array(starCount);
    var velocity = new Float32Array(starCount * 3);

    let p = {};
    let v = {};

    // create buffers for each of the data fields packed into our bin file
    for(var i = 0; i < starCount; i++) {
      let starRec = {};
      // construct GPU buffers for each value
      p.x = verts[(i * 3) + 0] = this.stardata[(i * fields.length) + 0];
      p.y = verts[(i * 3) + 1] = this.stardata[(i * fields.length) + 1];
      p.z = verts[(i * 3) + 2] = this.stardata[(i * fields.length) + 2];

      v.x = velocity[(i * 3) + 0] = this.stardata[(i * fields.length) + 3];
      v.y = velocity[(i * 3) + 1] = this.stardata[(i * fields.length) + 4];
      v.z = velocity[(i * 3) + 2] = this.stardata[(i * fields.length) + 5];

      absmag[i] = this.stardata[(i * fields.length) + 6];
      ci[i] = this.stardata[(i * fields.length) + 7];

      // precalculate the color of the star based on its temperature
      let c = this.getColorForTemp(this.stardata[(i * fields.length) + 7]).multiplyScalar(1.15)
      color[(i * 4) + 0] = c.x;
      color[(i * 4) + 1] = c.y;
      color[(i * 4) + 2] = c.z;
      color[(i * 4) + 3] = c.w;

      // precalculate the star scale offset based on its magnitude
      starScale[i] = Math.max(.5, Math.min(5.0, 7.0 * (1.0 - this.logScale(absmag[i]))));

      starRec.position = { x: p.x, y: p.y, z: p.z };
      starRec.absMag = absmag[i];
      starRec.color = c;
      starRec.temp = this.stardata[(i * fields.length) + 4];

      // add the star to the local spatial hash for fast querying
      this.addStarToHash(p, i);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(starRec);
    }

    geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    geo.addAttribute( 'velocity', new THREE.BufferAttribute(velocity, 3) );
    geo.addAttribute( 'absmag', new THREE.BufferAttribute(absmag, 1) );
    geo.addAttribute( 'ci', new THREE.BufferAttribute(ci, 1) );
    geo.addAttribute( 'starColor', new THREE.BufferAttribute(color, 4) );
    geo.addAttribute( 'starScale', new THREE.BufferAttribute(starScale, 1) );

    this.geo = geo;
    window.sel = this.el;
  },

  update: function (oldData) {
    // console.log(this.data, oldData);
    console.log(this.data);
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
          });

        break;

      case STARFIELD_READY:
      console.log(this.data.scale)
        if(this.data.scale !== oldData.scale) {
          console.log('NEW SCALE');
          // this.scaleParent.position.copy(this.camera.object3D.position);
          // THREE.SceneUtils.attach(this.el.object3D, this.el.sceneEl.object3D, this.scaleParent);
          TweenLite.to(this.tws, 1, {val: this.data.scale, ease: Power2.easeInOut, onComplete: () => {
            // THREE.SceneUtils.detach(this.el.object3D, this.el.sceneEl.object3D, this.scaleParent);
            this.el.setAttribute('starfield', { state: STARFIELD_READY });
          }});
          this.el.setAttribute('starfield', { state: STARFIELD_SCALING });
        }
        break;

      case STARFIELD_BUILDING:

        break;

      case STARFIELD_SCALING:

        break;
    }
  },
  tick: function(time, delta) {
    let p = this.camera.getAttribute('position');
    let s = this.el.getAttribute('scale').x;
    if(this.data.state === STARFIELD_SCALING) {
      // this.scaleParent.scale.set(this.tws.val, this.tws.val, this.tws.val);
      this.el.setAttribute('scale', `${this.tws.val} ${this.tws.val} ${this.tws.val}`)
      this.starfieldMat.uniforms['starfieldScale'].value = this.tws.val;
    }
    this.starfieldMat.uniforms['cameraPosition'].value = this.el.object3D.worldToLocal(new THREE.Vector3(p.x, p.y, p.z));
    this.starfieldMat.uniforms['uTime'].value = time;
    this.starfieldMat.uniforms['uStarfieldTime'].value = this.data.time;
  }
});
