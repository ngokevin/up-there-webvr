function requireAll (req) { req.keys().forEach(req); }

// overwrite with the latest Sprite class that fixes a raycasting scale error
THREE.Sprite = require('../vendor/Sprite');
require('../css/main.scss');
require('./components/solar-corona.js');

require('aframe-html-shader');
require('aframe-look-at-component');
require('aframe-redux-component');

// // systems
requireAll(require.context('./systems/', true, /\.js$/));

// // reducers
require('./reducers/worldSettings.js');

// // controls
requireAll(require.context('./components/controls/', true, /\.js$/));

// // ui elements
requireAll(require.context('./components/', true, /\.js$/));
