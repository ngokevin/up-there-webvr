var starnames = require('../../assets/data/starnames.json');

const SELECT_STAR = 'SELECT_STAR'
    , HOVER_STAR = 'HOVER_STAR';

/* globals AFRAME THREE */
AFRAME.registerComponent('star-selector', {
  schema: {
    currentStar: { type: 'int', default: -1}
  },

  init: function () {
    this.starfield = document.getElementById('starfield');

    this.el.addEventListener('mouseenter', evt => {
      // debugger;
      let s = null;
      try {
        if(evt.detail.intersectedEl.classList.contains('hoverable')) {
          s = parseInt(evt.detail.intersectedEl.getAttribute('id').split('_')[1]);
        }
      } catch (e) {
        console.log(e);
        return;
      }
      if(s !== null) {
        this.setHover(s);
      }

      // this.setHover()
    })
    this.el.addEventListener('mouseleave', evt => {
      // debugger;
      if(evt.detail.intersectedEl.classList.contains('hoverable')) {
        if(this.el.sceneEl.systems.redux.store.getState().worldSettings.hoverStar == evt.detail.intersectedEl.getAttribute('id').split('_')[1]) {
          this.setHover(-1);
        }
      }
    })
  },
  setHover: function(id) {
    this.el.sceneEl.systems.redux.store.dispatch({
      type: HOVER_STAR,
      id: id
    })
  },

  getPosString: function(p) {
    return `${p.x} ${p.y} ${p.z}`
  },
});
