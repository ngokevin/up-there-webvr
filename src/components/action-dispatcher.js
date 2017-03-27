  // dispatches an action on click events
  AFRAME.registerComponent('action-dispatcher', {
    schema: {
      type: {type: 'string', default: ''},
      value: {type: 'string', default: ''},
      evt: { type: 'string', default: 'click'}
    },
    init: function() {
      this.el.addEventListener(this.data.evt, this.handleClick.bind(this));
    },
    handleClick: function(evt) {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: this.data.type,
        value: this.data.value
      })
    },
  });
