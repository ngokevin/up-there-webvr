// Component to change to random color on click.
AFRAME.registerComponent('player-controls', {
  schema: {
    target: {type: 'string', default: 'acamera'}
  },
  init: function () {
    this.cursor = document.getElementById('acursor');
    this.cursor.addEventListener('mouseenter', (evt) => {
      console.log(evt);
    })
  },
  tick: function() {

  }
});
