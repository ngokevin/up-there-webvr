AFRAME.registerReducer('worldSettings', {
  actions: {
    SCALE_DOWN: 'SCALE_DOWN',
    SCALE_UP: 'SCALE_UP',
    SPEED_DOWN: 'SPEED_DOWN',
    SPEED_UP: 'SPEED_UP'
  },

  initialState: {
    scale: '10 10 10',
    speed: 1,
    minScale: .001,
    minSpeed: 1
  },

  reducer: function (state, action) {
    state = state || this.initialState;
    switch (action.type) {

      case this.actions.SCALE_UP: {
        var newState = Object.assign({}, state);
        let s = newState.scale.split(' ')[0]
        let newScale = s * 10;
        newState.scale = `${newScale} ${newScale} ${newScale}`;
        return newState;
      }
      case this.actions.SCALE_DOWN: {
        var newState = Object.assign({}, state);
        let s = newState.scale.split(' ')[0];
        let newScale = Math.max(newState.minScale, s * .1);
        newState.scale = `${newScale} ${newScale} ${newScale}`;
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
