/* globals AFRAME THREE */

// var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
AFRAME.registerShader('reticleMat', {
  schema: {
    dashSize: {default: 3},
    lineWidth: {default: 1},
    selectedStar: { type: 'int', default: -1}
  },
  /**
   * `init` used to initialize material. Called once.
   */
  init: function (data) {
    this.material = new THREE.SpriteMaterial({ color: 0xffaaed });
    // this.update(data);  // `update()` currently not called after `init`. (#1834)
  },
  /**
   * `update` used to update the material. Called on initialization and when data updates.
   */
  update: function (data) {
   //  this.material.dashsize = data.dashsize;
   //  this.material.linewidth = data.linewidth;
  }
});

var spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffaaed,
  transparent: true,
  map: new THREE.TextureLoader().load( "assets/images/reticle.png" ),
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending
});

AFRAME.registerComponent('reticle', {
  schema: {
    color: {type: 'vec4', default: '.3 1 .3 1'}
  },

  init: function () {
    // this.sprite = new THREE.Sprite()
    this.el.setObject3D('sprite', new THREE.Sprite(spriteMaterial));
  },

  update: function () {
    // var vertices = [];
    // var start = this.data.start;
    // var end = this.data.end;
    // var halfX = (start.x + end.x) / 2;
    // var halfY = (start.y + end.y) / 2;
    // var halfZ = (start.z + end.z) / 2;
    // var half = new THREE.Vector3(halfX, halfY, halfZ);
    // vertices.push(start);
    // vertices.push(half);
    // vertices.push(end);
    // this.geometry.vertices = vertices;
    // this.geometry.verticesNeedUpdate = true;
  }

});
