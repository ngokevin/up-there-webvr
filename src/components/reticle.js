/* globals AFRAME THREE */

var spriteMaterial = new THREE.SpriteMaterial({
  color: 0x99aaff,
  transparent: true,
  map: new THREE.TextureLoader().load( "assets/images/reticle.png" ),
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending
});

var spritePlanetMaterial = new THREE.SpriteMaterial({
  color: 0xedffaa,
  transparent: true,
  map: new THREE.TextureLoader().load( "assets/images/reticle.png" ),
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending
});

var spriteFlareMaterial = new THREE.SpriteMaterial({
  color: 0xedffaa,
  transparent: true,
  map: new THREE.TextureLoader().load( "assets/images/lensflare4.jpg" ),
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending
});

var starGlarelMat = new THREE.ShaderMaterial({
    uniforms: {
      "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
      "starDecal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/lensflare4.jpg" ) },
      "sphereMask": { type: "t", value: new THREE.TextureLoader().load( "assets/images/sphere-mask.png" ) },
      "starfieldScale": { type: "f", value: 1 },
      "uTime": { type: "f", value: 0.1 },
      "uStarfieldTime": { type: "f", value: 0.0 },
      "uDetailDrawDistance": { type: "f", value: 15.0 }
    },
    vertexShader: require('../glsl/star-glare.vert'),
    fragmentShader: require('../glsl/star-glare.frag'),
    // depthTest: false,
    // depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

var starData = null;

AFRAME.registerComponent('reticle', {
  schema: {
    color: {type: 'vec4', default: '.3 1 .3 1'}
  },

  init: function () {
    // this.sprite = new THREE.Sprite()
    this.el.setObject3D('sprite', new THREE.Sprite(spriteMaterial));

    // this.el.object3D.add(new THREE.Sprite(starGlarelMat));



    //  lensFlare.position.copy(spotLight.position);
    // this.el.setObject3D('flare', lensFlare);
  },
  handleStateUpdate: function() {

  },
  update: function() {
    // console.log('Reticle updated.');
  },

});
