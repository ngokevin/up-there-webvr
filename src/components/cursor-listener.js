// Component to change to random color on click.
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener('click', function (evt) {
      var randomIndex = Math.floor(Math.random() * COLORS.length);
      this.setAttribute('material', 'color', 0xffffff * Math.random());
      console.log('I was clicked at: ', evt.detail.intersection.point);
    });
  }
});
