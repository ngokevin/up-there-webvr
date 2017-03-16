// var stardata = require('../../data/stardata.json')
var fields = ['x','y','z','absmag','ci']; // all float32s

/* globals AFRAME THREE */
AFRAME.registerComponent('starfield', {
  schema: {
    src: {type: 'asset'}
  },

  init: function () {

    this.starfieldMat = new THREE.ShaderMaterial({
        uniforms: {
        },
        vertexShader: require('../glsl/starfield.vert'),
        fragmentShader: require('../glsl/starfield.frag'),
      })

  },

  buildStarfieldGeometry: function() {

    console.log(`Processing ${this.stardataraw.byteLength} bytes of stardata...`);

    var starCount = this.stardata.length / fields.length;
    console.log(starCount);
    var geo = new THREE.BufferGeometry();
    var verts = new Float32Array(starCount * 3);
    var absmag = new Float32Array(starCount);
    var ci = new Float32Array(starCount);

    // create buffers for each of the data fields packed into our bin file
    for(var i = 0; i < starCount; i++) {
      verts[(i * 3) + 0] = this.stardata[(i * fields.length) + 0];
      verts[(i * 3) + 1] = this.stardata[(i * fields.length) + 1];
      verts[(i * 3) + 2] = this.stardata[(i * fields.length) + 2];
      absmag[i] = this.stardata[(i * fields.length) + 3];
      ci[i] = this.stardata[(i * fields.length) + 4];
    }

    geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    geo.addAttribute( 'absmag', new THREE.BufferAttribute(absmag, 1) );
    geo.addAttribute( 'ci', new THREE.BufferAttribute(ci, 1) );

    this.geo = geo;

  },

  update: function (oldData) {

    fetch('/assets/data/stardata.bin')
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
        console.log(m);
        this.el.setObject3D('mesh', mesh);
      });

  },
  tick: function(time, delta) {

  }
});
