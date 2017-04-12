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

    this.frameMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "assets/images/star-detail-frame-atlas.jpg" ) })

    this.updateMaterials = this.updateMaterials.bind(this);
    this.updateMaterials();
    // this.el.addEventListener('html-ready', (evt) => {
    //   let self = evt.detail.target;
    //   let mats = evt.detail.target.sceneEl.systems.material.materials;
    //   let m = mats[Object.keys(mats)[0]];
    //   this.htmlMat = m;
    //   this.updateMaterials();
    // })
  },
  updateMaterials: function() {
    if(this.modelJson.hasLoaded) {
      this.parseJsonFile();
    } else {
      this.unsubscribe = this.modelJson.addEventListener('loaded', this.parseJsonFile.bind(this));
    }
  },
  parseJsonFile: function() {
    if(this.unsubscribe) {
      this.modelJson.removeEventListener(this.unsubscribe);
    }

    this.objectLoader.parse(JSON.parse(this.modelJson.data), (group) => {
      // create a parent object for all objects without behavior
      var pobj = new THREE.Object3D();

      // spawn entities with appropriate behaviors based on obj names
      group.children.forEach( c => {

        // use the system to initialize new panel displays and materials
        if(c.name.indexOf('panel-display') !== -1) {
          let e = this.system.generatePanelDisplay(c.clone());
          this.el.appendChild(e);
          // group.remove(c);
        } else  // initialize panel buttons to templates based on naming convention
        if(c.name.indexOf('btn') !== -1) {
          c.material = this.frameMat;
          if(c.name.indexOf('panel') !== -1) {
            let e = this.system.generatePanelButton(c.clone());
            this.el.appendChild(e);
            // e.object3D.material = this.frameMat;
            // group.remove(c);
          }
        } else
        // all panel elements also share a single atlas
        if(c.name.indexOf('frame') !== -1) {
          c.material = this.frameMat;
          pobj.add(c.clone());
        } else {
          pobj.add(c.clone());
        }
      })

      this.el.setObject3D('mesh', pobj);
      this.ready = true;
      this.update();
    })
  },
  update: function (oldData) {
    if(!this.ready) return;

    this.targetEl.innerHTML = detailTemplate(this.system.getStarDetails());
    setTimeout(() => {
      // this.el.emit('update-html-texture');
    }, 850);
  },
  tick: function(time, timeDelta) {
    // this.el.emit('update-html-texture');
    // this.coronaMat.uniforms['uTime'].value = time;
  }
});
