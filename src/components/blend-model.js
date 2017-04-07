// Component to change to random color on click.
AFRAME.registerComponent('blend-model', {
  schema: {
    src: {type: 'string'},
    morphTargets: {type: 'boolean', default: false},
    targetObjectName: { type: 'string', default: undefined }
  },
  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.objectLoader.setCrossOrigin('');
  },

  update: function (oldData) {
    var self = this;
    var src = this.data.src;
    if (!src || src === oldData.src) { return; }

    let obj;

    this.objectLoader.load(this.data.src, (group) => {
      if(this.data.morphTargets) {
        let o = group.getObjectByName(this.data.targetObjectName, true);
        if(o !== undefined) {
          o.updateMorphTargets();
          o.material.morphTargets = true;
        }
        this.el.setObject3D('mesh', o);
        obj = o;
      } else {
        this.el.setObject3D('mesh', group.children[0]);
        obj = group;
      }

      this.el.emit('model-loaded', {format: 'json', model: obj, src: src});
    });
  }
});
