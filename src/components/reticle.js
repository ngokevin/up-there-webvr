/* globals AFRAME THREE */

var spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffaaed,
  transparent: true,
  map: new THREE.TextureLoader().load( "assets/images/reticle.png" ),
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending
});

var starData = null;

AFRAME.registerComponent('reticle', {
  schema: {
    color: {type: 'vec4', default: '.3 1 .3 1'}
  },

  init: function () {
    // this.sprite = new THREE.Sprite()
    this.el.setObject3D('sprite', new THREE.Sprite(spriteMaterial));

  },

  update: function () {

  },

  getHoverText: function() {
    return starData[parseInt(this.el.getAttribute('starId').split('_')[1])]
  }
});
