/* globals AFRAME THREE */
AFRAME.registerComponent('star-selector', {
  schema: {

  },

  init: function () {
    var starfield = this.starfield = document.getElementById('starfield');
    var cursor = this.cursor = document.getElementById('acursor');
    this.lastCursorPos = cursor.getAttribute('position');
    this.tick = this.tick.bind(this);
  },

  update: function (oldData) {

  },

  tick(time, timeDelta) {
    debugger;
    let p = this.starfield.getNearestStarPosition(this.cursor.object3D.getWorldPosition());
    // console.log(p);
    if(p) {
      this.el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
    }
  }
});
