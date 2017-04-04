// dispatches an action on click events
AFRAME.registerComponent('hover-color', {
  schema: {
    onColor: {type: 'string', default: '#4499ff'},
    offColor: {type: 'string', default: '#333'}
  },
  init: function() {
    this.el.addEventListener('stateadded', this.handleStateUpdate.bind(this));
    this.el.addEventListener('stateremoved', this.handleStateUpdate.bind(this));
  },
  handleStateUpdate: function(evt) {
    if(this.el.is('cursor-hovered')) {
      this.el.setAttribute('material', 'color', this.data.onColor);
    } else {
      this.el.setAttribute('material', 'color', this.data.offColor);
    }

  }
});
