// Component to change to random color on click.
AFRAME.registerComponent('star-detail-ui', {
  schema: {
    src: {type: 'string'},
    morphTargets: {type: 'boolean', default: false},
    targetObjectName: { type: 'string', default: undefined },
    color: { type: 'string', default: '#ffffff' }
  },
  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.modelJson = document.getElementById('star-detail-ui-asset');


    this.updateMaterials = this.updateMaterials.bind(this);

    this.el.addEventListener('html-ready', (evt) => {
      let self = evt.detail.target;
      let mats = evt.detail.target.sceneEl.systems.material.materials;
      let m = mats[Object.keys(mats)[0]];
      this.htmlMat = m;
      this.updateMaterials();
    })
  },
  updateMaterials: function() {
    if(this.modelJson.hasLoaded) {
      this.parseJsonFile();
    } else {
      this.modelJson.addEventListener('loaded', this.parseJsonFile.bind(this));
    }
  },
  parseJsonFile: function() {
    this.objectLoader.parse(JSON.parse(this.modelJson.data), (group) => {
      // debugger;
      // console.log(this.el.sceneEl.systems.material.materials)
      group.children.forEach( c => {
        if(c.name.indexOf('ui.') !== -1) {
          c.material = this.htmlMat;
        }

      })
      group.rotation.y = Math.PI;
      this.el.setObject3D('mesh', group);
    })
  },
  update: function (oldData) {

  },
  tick: function(time, timeDelta) {
    // this.coronaMat.uniforms['uTime'].value = time;
  }
});
