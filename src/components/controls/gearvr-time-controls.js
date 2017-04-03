/* globals AFRAME THREE */
AFRAME.registerComponent('gearvr-time-controls', {
  schema: {
    active: {type: 'boolean', default: false},
    direction: {type: 'float', default: 0.0},
    warpSpeed: {type: 'float', default: 1.0},
    speed: {type: 'float', default: 1.0}
  },

  init: function () {
    this.handleControlChange = this.handleControlChange.bind(this);
    this.cursor = document.getElementById('acursor');
    this.hand = document.getElementById('right-hand');

    this.hand.addEventListener('axismove', (evt) => {
      this.handleControlChange(evt.detail.axis[1], evt);
    })

    this.cursor = document.getElementById('acursor');

    this.tick = this.tick.bind(this);
  },

  handleControlChange(state, evt) {
    if(this.data.active !== (state !== 0)) {
      this.data.active = state !== 0;
      this.data.direction = -state;
      this.cursor.setAttribute('material', 'color', state ? "#0066ff" : "#ffffff" );
    }
  },

  update: function (oldData) {

  },

  tick: function(time, timeDelta) {
    if(this.data.active) {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: this.data.direction === -1 ? "TIME_DOWN" : "TIME_UP"
      })
    }
  }

});
