// Component to change to random color on click.
AFRAME.registerComponent('follow-entity', {
  schema: {
    target: {type: 'string', default: 'acamera'}
  },
  init: function () {
    this.targetEl = document.getElementById(this.data.target);
  },
  tick: function() {
    // console.log('following');
    this.el.setAttribute('position', this.targetEl.getAttribute('position'));
  }
});
