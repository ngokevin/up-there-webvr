// var stardata = require('../../data/stardata.json')
var fields = ['x','y','z','absmag','ci']; // all float32s
var stardata = require('../../assets/data/stardata.json');
/* globals AFRAME THREE */
AFRAME.registerComponent('starfield', {
  schema: {
    src: {type: 'asset'}
  },

  init: function () {
    var el = this.el;

    this.starfieldMat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "starDecal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/star-decal.png" ) }
        },
        vertexShader: require('../glsl/starfield.vert'),
        fragmentShader: require('../glsl/starfield.frag'),
        transparent: true
      });

    this.tick = this.tick.bind(this);
    this.changeStarfieldScale = this.changeStarfieldScale.bind(this);
    this.starLocations = [];
    this.spatialHash = {};
    this.hashResolution = 1.0;

    this.camera = document.getElementById('acamera');

    this.el.getNearestStarPosition = this.getNearestStarPosition.bind(this);
  },

  changeStarfieldScale: function(size) {
    this.el.setAttribute('scale', `${size} ${size} ${size}`);
  },

  getHashKey: function(pos) {
    return `${Math.floor(pos.x / this.hashResolution)}_${Math.floor(pos.y / this.hashResolution)}_${Math.floor(pos.z / this.hashResolution)}`;
  },

  getStarsNearLocation: function(pos) {
    let h = this.getHashKey(pos);
    if(this.spatialHash[h] !== undefined) {
      return this.spatialHash[h];
    } else {
      return [];
    }
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

  getNearestStarPosition: function(pos) {
    let s = this.getStarsNearLocation(pos);
    if(s.length > 0) {
      var p1 = new THREE.Vector3(pos.x, pos.y, pos.z);
      var p2 = new THREE.Vector3();
      let x = s.sort( (a,b) => {
        let da = p2.set(a.x, a.y, a.z).distanceTo(p1);
        let db = p2.set(b.x, b.y, b.z).distanceTo(p1);
        if(da < db) {
          return -1;
        } else if(da > db) {
          return 1;
        }
        return 0;
      });
      return this.getStarPosition(x[0]);
      // return this.getStarPositionVec3(s[0]);
    } else {
      return false;
    }
  },

  buildStarfieldGeometry: function() {

    console.log(`Processing ${this.stardataraw.byteLength} bytes of stardata...`);

    var starCount = this.stardata.length / fields.length;
    console.log(starCount);
    var geo = new THREE.BufferGeometry();
    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var ci = new Float32Array(starCount);

    let p = {};

    // create buffers for each of the data fields packed into our bin file
    for(var i = 0; i < starCount; i++) {

      // construct GPU buffers for each value
      p.x = verts[(i * 3) + 0] = this.stardata[(i * fields.length) + 0];
      p.y = verts[(i * 3) + 1] = this.stardata[(i * fields.length) + 1];
      p.z = verts[(i * 3) + 2] = this.stardata[(i * fields.length) + 2];
      absmag[i] = this.stardata[(i * fields.length) + 3];
      ci[i] = this.stardata[(i * fields.length) + 4];

      // add the star to the local spatial hash for fast querying
      this.addStarToHash(p, i);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));

    }

    console.log("Len: " + Object.keys(this.spatialHash).length);

    geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    geo.addAttribute( 'absmag', new THREE.BufferAttribute(absmag, 1) );
    geo.addAttribute( 'ci', new THREE.BufferAttribute(ci, 1) );

    this.geo = geo;
    window.sel = this.el;
  },

  update: function (oldData) {

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
      });

  },
  tick: function(time, delta) {
    let p = this.camera.getAttribute('position');
    this.starfieldMat.uniforms['cameraPosition'].value = new THREE.Vector3(p.x, p.y, p.z);
  }
});
