// Component to change to random color on click.
AFRAME.registerComponent('blend-model', {
  schema: {
    src: {type: 'string'},
    morphTargets: {type: 'boolean', default: false}
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
      if(this.data.morphTargets) {
        group.children[0].updateMorphTargets();
        group.children[0].material.morphTargets = true;
      }
      this.el.setObject3D('mesh', group.children[0]);
      this.el.emit('model-loaded', {format: 'json', model: group.children[0], src: src});
    });
  },
  tick: function(time, timeDelta) {
  }
});
