// var starnames = require('../../assets/data/starnames.json');

/* globals AFRAME THREE */
AFRAME.registerComponent('star-detail-view', {
  schema: {
    selectedStar: { type: 'int', default: -1 }
  },

  init: function () {
    this.starfield = document.getElementById('starfield');
  },
  update: function(oldData) {
    if(this.data.selectedStar !== oldData.selectedStar) {
      // going into detail view mode
      if(this.data.selectedStar > -1) {
        // update detail view position
        let star = this.starfield.components.starfield.getStarData(this.data.selectedStar);
        // this.el.setAttribute('position', `${star.position.x} ${star.position.y} ${star.position.z}`);

        // update detail view scale
        this.el.setAttribute('visible', 'true');

        this.el.setAttribute('sol-scale', star.radius);
      // leaving detail view mode
      } else {
        this.el.setAttribute('visible', 'false');
      }
    }
  }
});
