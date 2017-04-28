// require templates
var overviewTemplate = require('./templates/overview.ejs');
var planetsTemplate = require('./templates/planets.ejs');
var locationTemplate = require('./templates/location.ejs');

// Component to change to random color on click.
AFRAME.registerComponent('star-detail-panel-display', {
  schema: {
    name: { type: 'string', default: 'panel1' },
    selectedPanel: { type: 'string', default: ''}
  },
  init: function () {
    this.templates = {
      overview: overviewTemplate,
      planets: planetsTemplate,
      location: locationTemplate
    }
    console.log(`🔭 star detail panel display initialized`);
    // debugger;
  },
  update: function() {
    if(this.templates[this.data.selectedPanel] !== undefined) {
      let o = this.templates[this.data.selectedPanel](this.el.sceneEl.systems.redux.store.getState().worldSettings);
      document.getElementById(this.data.name).innerHTML = o;
      this.el.emit('update-html-texture');
    }
  }
});
