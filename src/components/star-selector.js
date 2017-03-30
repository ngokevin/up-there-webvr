var starnames = require('../../assets/data/starnames.json');

const SELECT_STAR = 'SELECT_STAR'
    , HOVER_STAR = 'HOVER_STAR'
    , HOVER_TEXT = 'HOVER_TEXT';

/* globals AFRAME THREE */
AFRAME.registerComponent('star-selector', {
  schema: {
    currentStar: { type: 'int', default: -1},
    dataReady: { type: 'boolean', default: false}
  },

  init: function () {
    this.starfield = document.getElementById('starfield');

    // subscribe to the starnames database
    this.starnames = document.getElementById('starNames');
    if(this.starnames.hasLoaded) {
      this.data.dataReady = true;
    } else {
      this.starnames.addEventListener('loaded', (evt) => {
        this.data.dataReady = true;
      })
    }


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

    this.el.addEventListener('click', evt => {
      let s = null;
      try {
        if(evt.detail.intersectedEl.classList.contains('hoverable')) {
          s = parseInt(evt.detail.intersectedEl.getAttribute('id').split('_')[1]);
        }
      } catch (e) {
        console.log(e);
        return;
      }
      if(s !== null && s == this.el.sceneEl.systems.redux.store.getState().worldSettings.hoverStar) {
        if(this.el.sceneEl.systems.redux.store.getState().worldSettings.selectedStar == s) {
          this.setSelected(-1);
        } else {
          this.setSelected(s);
        }

      }
    });
  },
  formatStarName: function(name) {
    if(name === 'U') {
      return 'Unnamed';
    } else {
      return name;
    }
  },
  setHover: function(id) {
    this.el.sceneEl.systems.redux.store.dispatch({
      type: HOVER_STAR,
      id: id
    })
    if(id > -1) {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: HOVER_TEXT,
        val: this.formatStarName(this.starfield.components.starfield.starnames[id])
      })
    } else {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: HOVER_TEXT,
        val: ""
      })
    }

  },
  setSelected: function(id) {
    this.el.sceneEl.systems.redux.store.dispatch({
      type: SELECT_STAR,
      id: id
    })
  },
  getPosString: function(p) {
    return `${p.x} ${p.y} ${p.z}`
  },
});
