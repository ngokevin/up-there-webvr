var Constellation = require('../Constellation')(THREE);
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
    init: function() {
      Object.keys(stardata).map( c => {
        let e = document.createElement('a-entity');
        e.setAttribute('constellation', 'name', c);
        this.el.appendChild(e);
      })
    },
    update: function () {

      // debugger;
      // var mesh = this.el.setObject3D('mesh', new Constellation(this.data.name, stardata[this.data.name]));
      // mesh.add(c);
    }
  })
// }
