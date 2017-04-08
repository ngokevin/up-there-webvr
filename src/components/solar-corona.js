// Component to change to random color on click.




AFRAME.registerComponent('solar-corona', {
  schema: {
    src: {type: 'string'},
    morphTargets: {type: 'boolean', default: false},
    targetObjectName: { type: 'string', default: undefined },
    color: { type: 'string', default: '#ffffff' }
  },
  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');

    let nTex = new THREE.TextureLoader().load( "assets/images/v3_perlin.png" );
    nTex.wrapS = nTex.wrapT = THREE.RepeatWrapping;

    let nTex2 = new THREE.TextureLoader().load( "assets/images/v3_perlin_1024.png" );
    nTex2.wrapS = nTex2.wrapT = THREE.RepeatWrapping;


    this.coronaMat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "noise1": { type: "t", value: nTex },
          "noise2": { type: "t", value: nTex2 },
          "uTime": { type: "f", value: 0.1 },
          "uStarfieldTime": { type: "f", value: 0.0 },
          "uStarColor": { type: "v4", value: new THREE.Vector4(1,1,1,1) },
        },
        vertexShader: require('../glsl/corona.vert'),
        fragmentShader: require('../glsl/corona.frag'),
        depthTest: false,
        // depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
  },

  update: function (oldData) {
    // debugger;
    let c = new THREE.Color('#'+this.data.color);
    this.coronaMat.uniforms['uStarColor'].value = new THREE.Vector4(c.r, c.g, c.b, 1.0);

    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }

    // debugger;

    let obj;

    this.objectLoader.load(this.data.src, (group) => {
      let m = group.children[0];
      m.material = this.coronaMat;
      this.el.setObject3D('mesh', m);
      obj = group;

      this.el.emit('model-loaded', {format: 'json', model: obj, src: src});
    });
  },
  tick: function(time, timeDelta) {
    this.coronaMat.uniforms['uTime'].value = time;
  }
});
