// require('../vendor/aframe-master.min.js');
require('aframe');
require('aframe-extras');
//require('aframe-ui-widgets');
require('aframe-stats-in-vr-component');
require('aframe-gearvr-controls-component');
require('aframe-auto-detect-controllers-component');
//require('super-hands');

window.saveAs = require('../vendor/saveas.js').saveAs;
require('./dragndrop.js');
require('./binarymanager.js');
require('../vendor/OrbitControls.js');

require('./utils.js');
require('./ui2d.js');

require('./systems/brush.js');
require('./systems/ui.js');
require('./systems/painter.js');

require('./components/brush.js');
require('./components/constellation.js');
require('./components/cursor-listener.js');
require('./components/if-no-vr-headset.js');
require('./components/json-model.js');
require('./components/line.js');
require('./components/look-controls-alt.js');
require('./components/orbit-controls.js');
require('./components/scale-ui.js');
require('./components/translate-ui.js');
require('./components/scale-ui-controls.js');
require('./components/star-selector.js');
require('./components/starfield-controls.js');
require('./components/gearvr-fly-controls.js');
require('./components/starfield.js');
require('./components/ui.js');
require('./components/ui-raycaster.js');

require('./brushes/line.js');
require('./brushes/stamp.js');
require('./brushes/spheres.js');
require('./brushes/cubes.js');
require('./brushes/rainbow.js');
require('./brushes/single-sphere.js');
