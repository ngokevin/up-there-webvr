/* globals AFRAME THREE */
AFRAME.registerComponent('keyboard-time-controls', {
  schema: {
    direction: {type: 'float', default: 0.0},
    speed: {type: 'float', default: 1.0},
    timeForwardKey: { type: 'string', default: 'r' },
    timeBackwardKey: { type: 'string', default: 'e' }
  },

  init: function () {

    document.addEventListener('keydown', (evt) => {
      switch(evt.key) {
        case this.data.timeForwardKey:
          if(this.data.direction !== this.data.speed) {
            this.data.direction = this.data.speed;
            // this.el.emit('setDirection', { d: this.data.direction });
            this.el.setAttribute('time-controls', { direction: this.data.direction } );
          }
          break;
        case this.data.timeBackwardKey:
          if(this.data.direction !== -this.data.speed) {
            this.data.direction = -this.data.speed;
            this.el.setAttribute('time-controls', { direction: this.data.direction } );
          }
          break;
      }
    });

    document.addEventListener('keyup', (evt) => {
      switch(evt.key) {
        case this.data.timeForwardKey:
        case this.data.timeBackwardKey:
          this.data.direction = 0;
          this.el.setAttribute('time-controls',  { direction: this.data.direction } );
          break;
      }
    })

  }

});
