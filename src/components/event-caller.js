
  AFRAME.registerComponent('event-caller', {
    schema: {
      target: {type: 'string', default: ''},
      eventName: {type: 'string', default: ''}
    },
    init: function() {
      this.target = document.getElementById(this.data.target);
      this.el.addEventListener('click', this.handleClick.bind(this));
    },
    handleClick: function(evt) {
      this.target.emit(this.data.eventName)
    },
  });
