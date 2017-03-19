var Constellation = require('../Constellation');
var stardata = require('../../assets/data/stardata.json');
//
// module.exports = function(AFRAME) {
  // Registering component in foo-component.js
  AFRAME.registerComponent('constellation', {
    schema: {
      name: {default: 'Orion'}
    },
    update: function () {
      var mesh = this.el.getOrCreateObject3D('object3D', THREE.Object3D);
      var c = new Constellation(this.data.name, stardata[this.data.name]);
      mesh.add(c);
      console.log("CONSTELLATION");
    }
  });

  AFRAME.registerComponent('constellations', {
    update: function () {
      var mesh = this.el.getOrCreateObject3D('object3D', THREE.Object3D);
      var c = new Constellation(this.data.name, stardata[this.data.name]);
      mesh.add(c);
    }
  })
// }
