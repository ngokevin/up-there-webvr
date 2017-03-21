
  AFRAME.registerComponent('entity-visibility-toggle', {
    schema: {
      target: {type: "string"}
    },
    init: function() {
      // bindings
      this.updateState = this.updateState.bind(this);
      this.target = document.getElementById(this.data.target);
      this.el.addEventListener('stateUpdated', (evt) => { this.updateState(evt.detail === true) })
    },
    updateState: function(state) {
      this.target.setAttribute('visible', state)
    }
  });
