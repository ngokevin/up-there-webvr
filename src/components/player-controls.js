var debounce = require('debounce');

// Component to change to random color on click.
AFRAME.registerComponent('player-controls', {
  schema: {
    target: {type: 'string', default: 'acamera'}
  },
  init: function () {
    this.cursor = document.getElementById('acursor');
    var x = 4;
    this.hand = document.getElementById('right-hand');
    this.handleClick = this.handleClick.bind(this);
    this.dbClick = debounce(this.handleClick, 200, true);
    this.hand.addEventListener('buttonchanged', (evt) => {
      if(evt.detail.state.pressed == true) {
        this.dbClick();
      }
    })
    this.currentTarget = false;
  },
  update: function() {

    this.el.addEventListener('raycaster-intersection', (evt) => {
      evt.detail.els.sort( e => {
        if(e.object3D !== undefined) {
          return e.object3D.position.distanceTo(this.el.object3D.position);
        }
      });
      this.currentTarget = evt.detail.els[0]
    });

    this.el.addEventListener('raycaster-intersection-cleared', (evt) => {
      this.currentTarget = false;
    });
  },
  handleClick: function() {
    if(this.currentTarget) {
      this.currentTarget.emit('click');
    }

  },
  tick: function() {

  }
});
