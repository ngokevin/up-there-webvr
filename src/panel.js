require('../css/main.scss')

var worldSettings = require('./reducers/worldSettings').reducer(null, { type: "NOTHING" })

// // load templates
var templates = {
  // overviewTemplate: require('./components/ui/templates/overview.ejs'),
  planetsTemplate: require('./components/ui/templates/planets.ejs'),
  // locationTemplate: require('./components/ui/templates/location.ejs')
}

worldSettings.helpers = require('./helpers');

let divs = Object.keys( templates ).map( k => {
  let d = document.createElement('div');
  d.innerHTML = templates[k](worldSettings);
  document.body.appendChild(d);
})

setInterval( () => {

  let e = document.getElementsByTagName('text');
  for(let i = 0; i < e.length; i += 1) {
    e[i].remove();
  }

}, 250);
