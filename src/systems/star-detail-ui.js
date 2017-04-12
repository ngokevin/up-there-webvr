const YEAR_MS = 365.25*24*60*60*1000;

var defaultStar = {
  name: 'Barnard\'s Star',
  stats: {
    starClass: 'Red Dwarf',
    starType: 'II',
    radius: 1.0,
    mass: 1.0,
    density: 1.0,
    temp: 5800,
    hrLocation: { x: .5, y: .5 }
  },
  time: {
    distance: 0.0,
    currentDate: Date.now(),
    radioRange: true,
    radioContactDate: Date.now()-YEAR_MS,
    skyLocation: { x: .5, y: .5 }
  },
  planets: [
    {
      name: 'Planet A',
      orbitalDistance: 1.0,
      orbitalPeriod: 365.25,
      radius: 1.0,
      mass: 1.0
    },
    {
      name: 'Planet A',
      orbitalDistance: .5,
      orbitalPeriod: 365.25,
      radius: 1.0,
      mass: 1.0
    },
    {
      name: 'Planet A',
      orbitalDistance: .75,
      orbitalPeriod: 365.25,
      radius: 1.0,
      mass: 1.0
    }
  ]
};


/* globals AFRAME */
AFRAME.registerSystem('star-detail-ui', {
  init: function() {

  },
  // accepts a star id and updates s
  update: function(id) {

  },
  // builds a starDetail context for the given id
  getStarDetails: function(id) {
    let s = Object.assign({}, defaultStar);
    return s;
  }
});
