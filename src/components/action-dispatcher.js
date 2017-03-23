  // dispatches an action on click events
  AFRAME.registerComponent('action-dispatcher', {
    schema: {
      type: {type: 'string', default: ''},
      value: {type: 'string', default: ''}
    },
    init: function() {
      this.el.addEventListener('click', this.handleClick.bind(this));
    },
    handleClick: function(evt) {
      this.el.sceneEl.systems.redux.store.dispatch({
        type: this.data.type,
        value: this.data.value
      })
    },
  });
