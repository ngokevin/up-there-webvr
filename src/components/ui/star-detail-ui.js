var detailTemplate = require("./templates/star-detail.ejs");
var bezier = require('cubic-bezier');

// The *star-detail-ui* component renders a display panel and model for the
// currentStar as set in the worldSettings store.

// Component to change to random color on click.
AFRAME.registerComponent('star-detail-ui', {
  schema: {
    src: {type: 'string'},
    targetEl: { type: 'string', default: 'star-detail' },
    morphTargets: {type: 'boolean', default: false},
    targetObjectName: { type: 'string', default: undefined },
    color: { type: 'string', default: '#ffffff' },
    selectedPanel: { type: 'string', default: ''},
    selectedStar: { type: 'int', default: -1}
  },
  init: function () {

    this.objectLoader = new THREE.ObjectLoader();
    this.modelJson = document.getElementById('star-detail-ui-asset');
    this.targetEl = document.getElementById(this.data.targetEl);
    this.ready = false;

    this.frameMat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "assets/images/star-detail-frame-atlas.jpg" ) })

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
        vertexShader: require('../../glsl/corona.vert'),
        fragmentShader: require('../../glsl/corona.frag'),
        // depthTest: false,
        depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending
      });

    this.starScaleCurve = bezier(0., 0., 0., 1., 1000);

    this.starMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    })

    this.updateMaterials = this.updateMaterials.bind(this);
    this.updateMaterials();

    this.camera = document.getElementById('acamera');

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
      this.unsubscribe = this.modelJson.addEventListener('loaded', this.parseJsonFile.bind(this));
    }
  },
  // this loads info from the scene json file and attaches star-detail-ui planes
  // and buttons to the appropriate behavior.
  // There is probably a better way to do this,
  // but I am a limited creature.
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
       // all panel elements also share a single atlas
        } else if(c.name.indexOf('frame') !== -1) {
          c.material = this.frameMat;
          pobj.add(c.clone());
        } else if(c.name.indexOf('corona') !== -1) {
          console.log("☀️ corona")
          c.material = this.coronaMat;
          this.coronaModel = c.clone()
          pobj.add(this.coronaModel);
        } else if(c.name.indexOf('star') !== -1) {
          c.material = this.starMat;
          this.starModel = c.clone()
          pobj.add(this.starModel);
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
    if(oldData !== undefined && oldData.selectedStar !== this.data.selectedStar && this.data.selectedStar > -1) {
      let d = document.getElementById('panel-display0');
      if(d.emit !== undefined) {
        d.emit('update-html-texture');
      }
      this.el.setAttribute('look-at', `[camera]`);
      setTimeout(() => {
        this.el.removeAttribute('look-at');
      },100)
    }
    let c = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails.color;
    let r = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails.radius;

    this.coronaMat.uniforms['uStarColor'].value = c;
    let starScale = Math.max(0.1, Math.tanh(r*.5) * 2.0);

    this.starModel.scale.set(starScale,starScale,starScale);
    this.coronaModel.scale.set(starScale,starScale,starScale);

    let p = document.getElementById('acamera').getAttribute('position');

    // debugger;

  },
  tick: function(time, timeDelta) {
    // this.el.emit('update-html-texture');
    // this.coronaModel.lookAt(document.getElementById('acamera').object3D.position);
    this.coronaMat.uniforms['uTime'].value = time;
  }
});
