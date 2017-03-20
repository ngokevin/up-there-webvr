var starnames = require('../../assets/data/starnames.json');

/* globals AFRAME THREE */
AFRAME.registerComponent('star-selector', {
  schema: {

  },

  init: function () {
    var starfield = this.starfield = document.getElementById('starfield');
    var cursor = this.cursor = document.getElementById('acursor');

    this.lastCursorPos = "";//this.getPosString(cursor.getAttribute('position'));
    this.tick = this.tick.bind(this);

    this.camera = document.getElementById('acamera');
  },

  update: function (oldData) {
    var label = this.label = document.createElement('a-entity');
    label.setAttribute('text', 'value', 'Hello World!');
    label.setAttribute('text', 'width', '20');
    label.setAttribute('text', 'anchor', 'center');
    label.setAttribute('text', 'align', 'center');
    label.setAttribute('position', '0 2 0');
    this.el.appendChild(label);
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

  tick(time, timeDelta) {
    let p = this.starfield.getNearestStarPosition(this.cursor.object3D.getWorldPosition());
    if(p && this.getPosString(p.pos) !== this.lastCursorPos) {
      this.lastCursorPos = this.getPosString(p);
      this.label.setAttribute('text', 'value', `${this.getNameString(starnames[p.id])}`);
      this.el.object3D.lookAt(this.camera.object3D.position);
      this.el.setAttribute('position', p.pos);
    }
  }
});
