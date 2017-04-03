// Component to change to random color on click.
AFRAME.registerComponent('starfield-controls', {
  init: function () {
    this.el.addEventListener('axismove', (evt) => { console.log(evt); });
    this.el.addEventListener('buttonchanged', (evt) => { console.log(evt); });
  }
});
