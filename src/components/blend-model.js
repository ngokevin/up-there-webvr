// Component to change to random color on click.
AFRAME.registerComponent('blend-model', {
  schema: {
    src: {type: 'string'}
  },
  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');
    this.tick = this.tick.bind(this);
  },

  update: function (oldData) {
    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }
    this.objectLoader.load(this.data.src, (group) => {
      // var Rotation = new THREE.Matrix4().makeRotationX(0);
      // group.traverse(function (child) {
      //   if (!(child instanceof THREE.Mesh)) { return; }
      //   child.position.applyMatrix4(Rotation);
      // });
      this.anim = group.animations[0];
      this.mixer = new THREE.AnimationMixer(group);
      this.mixer.clipAction( this.anim ).play();
      this.el.setObject3D('mesh', group);
      this.el.emit('model-loaded', {format: 'json', model: group, src: src});
    });
  },

  tick: function(time, timeDelta) {
    if(this.mixer !== undefined) {
      this.mixer.update(timeDelta* .001);
    }

  }
});
