const TIME_IDLE = 'TIME_IDLE';
const TIME_ACTIVE = 'TIME_ACTIVE';
const TIME_WAITING = 'TIME_WAITING';
const TIME_REWINDING = 'TIME_REWINDING';

// var bezier = require('cubic-bezier');

/* globals AFRAME THREE */
AFRAME.registerComponent('time-controls', {
  schema: {
    active: {type: 'boolean', default: false},
    direction: {type: 'float', default: 0.0},
    speed: {type: 'float', default: 450.0},
    velocity: {type: 'float', default: 0.0},
    maxVelocity: {type: 'float', default: 30000.0},
    state: {type: 'string', default: TIME_IDLE},
    waitTime: {type: 'float', default: 0},
    waitDuration: {type: 'float', default: 100}
  },

  init: function () {
    this.tick = this.tick.bind(this);
  },

  updateVelocity: function(delta) {
    this.data.velocity += this.data.direction * this.data.speed * delta*.001;
    this.data.velocity = Math.min(this.data.maxVelocity, Math.max(-this.data.maxVelocity, this.data.velocity));
    if(this.data.direction === 0) {
      this.data.velocity *= .98;
    }
    this.el.setAttribute('time-controls', { velocity: this.data.velocity });
  },

  rewindVelocity: function(delta) {
    const t = parseFloat(this.el.sceneEl.systems.redux.store.getState().worldSettings.time);

    if(t === 0) return;
    let dir = t > 0 ? -1 : 1;
    if(Math.abs(t) < this.data.speed*10) {
      dir = dir * Math.abs(t/this.data.speed);
    }
    // calculate distance from end point to add friction as starts reapproach their present day location
    const brakeRange = 100000.;
    const f = Math.min(2., Math.pow(Math.abs(Math.min(brakeRange, Math.max(-brakeRange, t)) / brakeRange), .02));
    this.data.velocity += parseFloat(dir) * this.data.speed * delta * .01;
    this.data.velocity = Math.min(this.data.maxVelocity, Math.max(-this.data.maxVelocity, this.data.velocity)) * f;
    this.el.setAttribute('time-controls', { velocity: this.data.velocity });
  },

  tick: function(time, timeDelta) {
    let t = this.el.sceneEl.systems.redux.store.getState().worldSettings.time;
    switch(this.data.state) {
      case TIME_IDLE:
        // if idle, and there is a direction set, become active
        if(this.data.direction !== 0) {
          this.updateVelocity(timeDelta);
          this.el.setAttribute('time-controls', { state: TIME_ACTIVE } );
        }
        return;
        break;
      case TIME_ACTIVE:
        // if active and no direction is set, become waiting
        if(this.data.direction === 0) {
          console.log('waiting')
          this.el.setAttribute('time-controls', { waitTime: time } );
          this.el.setAttribute('time-controls', { state: TIME_WAITING } );
          return;
        }
        this.updateVelocity(timeDelta);
        break;
      case TIME_WAITING:
        console.log('waiting', this.data.waitTime + this.data.waitDuration, time)
        // if waiting and duration expired, become rewinding
        if(this.data.waitTime + this.data.waitDuration < time) {
          this.el.setAttribute('time-controls', { state: TIME_REWINDING } );
        // if waiting and direction is set, become active
        } else if(this.data.direction !== 0) {
          this.updateVelocity(timeDelta);
          this.el.setAttribute('time-controls', { state: TIME_ACTIVE } );
        } else {
          this.updateVelocity(timeDelta);
        }
        break;
      case TIME_REWINDING:
        // if rewinding and direction is set, become active
        if(this.data.direction !== 0) {
          this.el.setAttribute('time-controls', { state: TIME_ACTIVE } );
          this.updateVelocity(timeDelta);
        }
        this.rewindVelocity(timeDelta);
        break;
    }

    if(this.data.velocity !== 0) {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: 'SET_TIME',
        value: t + this.data.velocity
      })
    } else {
      // this.el.setAttribute('time-controls', { state: TIME_IDLE } );
    }

  }

});
