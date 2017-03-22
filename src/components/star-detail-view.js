var starnames = require('../../assets/data/starnames.json');

/* globals AFRAME THREE */
AFRAME.registerComponent('star-detail-view', {
  schema: {
    currentStar: { type: 'int', default: -1 }
  },

  init: function () {
    this.starfield = document.getElementById('starfield');
    this.starSelector = document.getElementById('star-selector');
    this.starMat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "uTime": { type: "f", value: 0.0 },
          "uStarColor": { type: "v4", value: new THREE.Vector4(1,1,1,1) }
        },
        vertexShader: require('../glsl/star-surface.vert'),
        fragmentShader: require('../glsl/star-surface.frag')
      });
    this.starSelector.addEventListener('starSelected', (evt) => {
      console.log('starSelected', evt.detail)
      if(this.data.currentStar === evt.detail) return false;
      this.el.setAttribute('star-detail-view', 'currentStar', evt.detail);
    })
    this.el.addEventListener('model-loaded', this.initializeModel.bind(this));
  },

  //{format: 'json', model: group, src: src}
  initializeModel: function(evt) {
    let g = evt.detail.model;
    let star = g.getObjectByName('Star', true);
    star.material = this.starMat;
    star.needsUpdate = true;
  },

  updateLabel: function() {
    if(this.label === undefined) {
      console.log("STARTING")
      var label = this.label = document.createElement('a-entity');
      this.el.appendChild(label);
    }
    this.label.setAttribute('text', 'width', '2');
    this.label.setAttribute('text', 'anchor', 'center');
    this.label.setAttribute('text', 'align', 'center');
    this.label.setAttribute('position', '0 .2 0');
    this.label.setAttribute('text', 'value', this.getNameString(starnames[this.data.currentStar]));
  },

  update: function (oldData) {
    if(this.data.currentStar === -1) return false;
    this.updateLabel();
    this.starMat.uniforms['uStarColor'].value = this.starfield.starDB[this.data.currentStar].color;
  },

  getPosString: function(p) {
    return `${p.x} ${p.y} ${p.z}`
  },

  getNameString: function(n) {
    if(n === "U") {
      return "Unnamed"
    } else {
      return n
    }
  },
  tick: function(time, deltaTime) {
    this.starMat.uniforms['uTime'].value = time;
  }
});
