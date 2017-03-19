var THREE = require('three')
var stardata = require('../data/stardata.json');
var Constellation = require('./Constellation');

window.THREE = THREE;

class Constellations extends THREE.Object3D {

  constructor() {
    super();

    for(var c in stardata) {
        this.add(new Constellation(c, stardata[c]));
    }
  }

  update(time) {
    this.t = time;
    return false;
  }

}

module.exports = Constellations;
