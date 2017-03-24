var Constellation = require('../Constellation')(THREE);
var stardata = require('../../assets/data/stardata.json');
//
// module.exports = function(AFRAME) {
  // Registering component in foo-component.js
  // AFRAME.registerComponent('constellation', {
  //   schema: {
  //     name: {default: 'Orion'}
  //   },
  //   init: function () {
  //     var mesh = this.el.getOrCreateObject3D('object3D', THREE.Object3D);
  //     var c = new Constellation(this.data.name, stardata[this.data.name]);
  //     mesh.add(c);
  //     console.log("CONSTELLATION");
  //   }
  // });

  AFRAME.registerComponent('constellations', {
    init: function() {
      // load all constellation verts into a single list
      let geo = this.buildGeometry();
      var mesh = this.el.getOrCreateObject3D('object3D', THREE.Object3D);
      var mat = new THREE.LineBasicMaterial({ color: 0x77ccff, linewidth: 1 });
      mesh.add( new THREE.LineSegments(geo, mat) );
    },
    buildGeometry() {

      var vertArray = [];
      Object.keys(stardata).map( c => {
        vertArray = vertArray.concat(stardata[c]);
      });

      var g = new THREE.BufferGeometry();

      var verts = new Float32Array(vertArray);

      g.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
      g.computeBoundingBox();

      return g;
    },
    update: function () {

      // debugger;
      // var mesh = this.el.setObject3D('mesh', new Constellation(this.data.name, stardata[this.data.name]));
      // mesh.add(c);
    }
  })
// }
