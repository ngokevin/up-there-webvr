// dispatches an action on click events
AFRAME.registerComponent('time-display', {
  schema: {
    time: { type: 'float', default: 0},
  },
  init: function() {

  },
  update(oldData) {
    if(this.data.time !== 0) {
      const currYear = Math.floor(this.data.time)+new Date().getFullYear();
      const yearString = currYear > 0 ? `CE` : `BCE`;
      this.setText(`${Math.abs(currYear)} ${yearString}`);
    } else {
      this.clearText();
    }
  },
  setText: function(val) {
    if(val !== undefined) {
      this.el.setAttribute('text', 'value', val);
    }
  },
  clearText: function(evt) {
    this.el.setAttribute('text', 'value', '');
  }
});
