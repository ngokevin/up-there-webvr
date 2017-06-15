/* globals AFRAME THREE */
AFRAME.registerComponent('keyboard-click-controls', {
  schema: {
    key: { type: 'string', default: 'c' }
  },

  init: function () {

    document.addEventListener('keydown', (evt) => {
      if(evt.key === this.data.key) {
        this.el.emit('click');
      }
    });

  }

});
