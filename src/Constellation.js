var stardata = require('../assets/data/stardata.json');
// window.THREE = THREE;

const ACTIVE_COLOR = 0xff9933;
const INACTIVE_COLOR = 0x77ccff;

var mat = new THREE.LineBasicMaterial({ color: 0x77ccff, linewidth: 1 });

module.exports = function(THREE) {
  class Constellation extends THREE.Object3D {

    constructor(name, vertexArray) {
      super();

      this.name = name;
      this.vertexArray = vertexArray;

      // create and add the constellation lines
      this.geo = this.buildGeometry();
      this.mesh = new THREE.LineSegments( this.geo, mat );

      this.mesh.userData.hoverTarget = true;
      this.mesh.userData.active = false;
      this.add(this.mesh);
    }

    buildGeometry() {

      var g = new THREE.BufferGeometry();

      var verts = new Float32Array(this.vertexArray);

      g.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
      g.computeBoundingBox();

      return g;
    }

    update(time) {
      // this.t = time;
      // if(this.mesh.userData.active) {
      //   this.mesh.material.color.set( ACTIVE_COLOR );
      //   this.mesh.userData.active = false;
      // } else {
      //   this.mesh.material.color.set( INACTIVE_COLOR );
      // }
      // return false;
    }

  }

  return Constellation
}
