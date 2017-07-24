require('aframe');

// overwrite with the latest Sprite class that fixes a raycasting scale error
THREE.Sprite = require('../vendor/Sprite');
require('../css/main.scss');
require('./components/solar-corona.js');

require('aframe-html-shader');
require('aframe-look-at-component');
require('aframe-redux-component');

// // systems
require('./systems/exoplanet.js')
require('./systems/ui.js')
require('./systems/star-detail-ui.js')
require('./systems/star-data.js')

// // reducers
require('./reducers/worldSettings.js');

// // controls
require('./components/controls/gearvr-fly-controls.js');
require('./components/controls/time-controls.js');
require('./components/controls/keyboard-time-controls.js');
require('./components/controls/keyboard-click-controls.js');
require('./components/controls/gearvr-time-controls.js');
var GamepadControls = require('aframe-gamepad-controls');
AFRAME.registerComponent('gamepad-controls', GamepadControls);

// // ui elements
require('./components/ui/star-detail-ui.js');
require('./components/action-dispatcher.js');
require('./components/blend-model.js');
require('./components/constellation.js');
require('./components/entity-visibility-toggle.js');
require('./components/follow-entity.js');
require('./components/reticle.js');
require('./components/ui/hover-text-display.js');
require('./components/ui/time-display.js');
require('./components/star-set-indicator.js');
require('./components/toggle-switch.js');
require('./components/starfield.js');
require('./components/star-detail-spawner.js');
