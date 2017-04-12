// Component to change to random color on click.
AFRAME.registerComponent('star-detail-panel-display', {
  schema: {
    name: { type: 'string', default: 'panel1' }
  },
  init: function () {
    console.log(`🔭 star detail panel display initialized`);
    // debugger;
  }
});
