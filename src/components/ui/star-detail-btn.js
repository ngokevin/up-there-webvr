// Component to change to random color on click.
AFRAME.registerComponent('star-detail-btn', {
  schema: {
    name: { type: 'string', default: 'panel1' }
  },
  init: function () {
    console.log(`🔭 star detail button initialized`);
  }
});
