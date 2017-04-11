var detailTemplate = require("./templates/star-detail.ejs");

// Component to change to random color on click.
AFRAME.registerComponent('star-detail-ui', {
  schema: {
    src: {type: 'string'},
    targetEl: { type: 'string', default: 'star-detail' },
    morphTargets: {type: 'boolean', default: false},
    targetObjectName: { type: 'string', default: undefined },
    color: { type: 'string', default: '#ffffff' }
  },
  init: function () {
    this.objectLoader = new THREE.ObjectLoader();
    this.modelJson = document.getElementById('star-detail-ui-asset');
    // debugger;
    this.targetEl = document.getElementById(this.data.targetEl);
    this.ready = false;

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

      // apply materials to each object in the asset
      group.children.forEach( c => {
        // all dynamic/html driven ui elements share a single material
        if(c.name.indexOf('ui.') !== -1) {
          c.material = this.htmlMat;
        }
      })

      group.rotation.y = Math.PI;
      this.el.setObject3D('mesh', group);
      this.ready = true;
      this.update();
    })
  },
  update: function (oldData) {
    if(!this.ready) return;
    
    this.targetEl.innerHTML = detailTemplate(this.system.getStarDetails());
    setTimeout(() => {
      this.el.emit('update-html-texture');
    }, 850);
  },
  tick: function(time, timeDelta) {
    // this.el.emit('update-html-texture');
    // this.coronaMat.uniforms['uTime'].value = time;
  }
});
