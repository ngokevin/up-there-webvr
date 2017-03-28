require('aframe');
// require('aframe-extras');
// require('aframe-html-shader');

require('aframe-gearvr-controls-component');
require('aframe-auto-detect-controllers-component');
require('aframe-redux-component');
require('aframe-lod');
require('aframe-event-set-component');
require('aframe-animation-component');
require('aframe-layout-component');

// require('../vendor/OrbitControls.js');

require('./utils.js');
// require('./ui2d.js');

// reducers
require('./reducers/worldSettings.js');

// components
require('./components/action-dispatcher.js');
require('./components/attribute-incrementer.js');
require('./components/blend-model.js');
require('./components/button-switch.js');
require('./components/constellation.js');
require('./components/cursor-listener.js');
require('./components/entity-visibility-toggle.js');
require('./components/event-caller.js');
require('./components/follow-entity.js');
require('./components/formatted-store-value.js');
require('./components/gearvr-fly-controls.js');
require('./components/gearvr-time-controls.js');
require('./components/if-no-vr-headset.js');
require('./components/indicator-light.js');
require('./components/json-model.js');
require('./components/line.js');
require('./components/location-indicator.js');
require('./components/look-controls-alt.js');
require('./components/orbit-controls.js');
require('./components/player-controls.js');
require('./components/reticle.js');
require('./components/scale-ui.js');
require('./components/sol-scale.js');
require('./components/sync-local-location.js');
require('./components/toggle-switch.js');
require('./components/translate-ui.js');
require('./components/scale-ui-controls.js');
require('./components/starfield.js');
require('./components/starfield-controls.js');
require('./components/star-selector.js');
require('./components/star-detail-view.js');
require('./components/star-detail-spawner.js');
