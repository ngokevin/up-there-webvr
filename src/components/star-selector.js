var starnames = require('../../assets/data/starnames.json');

/* globals AFRAME THREE */
AFRAME.registerComponent('star-selector', {
  schema: {
    currentStar: { type: 'int', default: -1}
  },

  init: function () {
    var starfield = this.starfield = document.getElementById('starfield');
    var cursor = this.cursor = document.getElementById('acursor');
    this.lastCursorPos = "";//this.getPosString(cursor.getAttribute('position'));
    this.tick = this.tick.bind(this);
    this.camera = document.getElementById('acamera');
  },


  getPosString: function(p) {
    return `${p.x} ${p.y} ${p.z}`
  },

  tick(time, timeDelta) {

    let pid = this.starfield.getNearestStarId(this.cursor.object3D.getWorldPosition())
    if(pid === -1 || pid === this.data.currentStar) return;

    let p = this.starfield.getNearestStarWorldLocation(this.cursor.object3D.getWorldPosition());
    if(p && this.getPosString(p.pos) !== this.lastCursorPos) {
      this.lastCursorPos = this.getPosString(p);
      this.el.setAttribute('scale', '0 0 0');
      this.el.setAttribute('position', p.pos);
      this.el.object3D.lookAt(this.camera.object3D.position);
      this.data.currentStar = p.id;
      this.el.emit('starSelected', this.data.currentStar);
    }
  }
});
