// Component to change to random color on click.
AFRAME.registerComponent('star-detail-panel', {
  schema: {
    name: { type: 'string', default: 'panel1' }
  },
  init: function () {
    console.log(`🔭 star detail panel initialized`);
  }
});
