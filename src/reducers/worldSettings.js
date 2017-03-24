AFRAME.registerReducer('worldSettings', {
  actions: {
    SCALE_DOWN: 'SCALE_DOWN',
    SCALE_UP: 'SCALE_UP',
    SPEED_DOWN: 'SPEED_DOWN',
    SPEED_UP: 'SPEED_UP',
    TIME_DOWN: 'TIME_DOWN',
    TIME_UP: 'TIME_UP',
    STARFIELD_READY: 'STARFIELD_READY',
    UPDATE_CURSOR_POSITION: 'UPDATE_CURSOR_POSITION'
  },

  initialState: {
    scale: 1,
    speed: 50,
    time: 0,
    starfieldReady: false,
    cursorPosition: { x: 0, y: 0, z: 0 },
    minScale: .001,
    minSpeed: 1
  },

  reducer: function (state, action) {
    state = state || this.initialState;
    switch (action.type) {

      case this.actions.UPDATE_CURSOR_POSITION: {
        var newState = Object.assign({}, state);
        newState.cursorPosition = Object.assign({}, newState.cursorPosition, action.position);
        return newState;
      }

      case this.actions.STARFIELD_READY: {
        var newState = Object.assign({}, state);
        newState.starfieldReady = true;
        return newState;
      }

      case this.actions.TIME_UP: {
        var newState = Object.assign({}, state);
        newState.time += 1000;
        return newState;
      }
      case this.actions.TIME_DOWN: {
        var newState = Object.assign({}, state);
        newState.time -= 1000;
        return newState;
      }

      case this.actions.SCALE_UP: {
        var newState = Object.assign({}, state);
        newState.scale *= 10;
        return newState;
      }
      case this.actions.SCALE_DOWN: {
        var newState = Object.assign({}, state);
        newState.scale = Math.max(newState.minScale, newState.scale * .1);
        return newState;
      }

      case this.actions.SPEED_UP: {
        var newState = Object.assign({}, state);
        if(newState.speed === 1) {
          newState.speed = 10;
        } else {
          newState.speed += 10;
        }
        return newState;
      }
      case this.actions.SPEED_DOWN: {
        var newState = Object.assign({}, state);
        newState.speed -= 10;
        newState.speed = Math.max(1., newState.speed);
        return newState;
      }


      default: {
        return state;
      }
    }
  }
});
