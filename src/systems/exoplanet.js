
var csv = require('csv-string');

/* globals AFRAME */
AFRAME.registerSystem('exoplanet', {
  init: function () {
    this.exoplanetsDB = document.getElementById('exoplanets');
    this.starfield = document.getElementById('starfield');
    this.exoplanetIdTable = [];
    window.store =this.store = this.sceneEl.systems.redux.store;
    if(this.exoplanetsDB.hasLoaded) {
      this.processExoplanetsDb();
    } else {
      this.exoplanetsDB.addEventListener('loaded', this.processExoplanetsDb.bind(this));
    }
  },
  processExoplanetsDb: function() {
    // process the CSV into an object
    let rawCsv = THREE.Cache.files[this.exoplanetsDB.getAttribute('src')];
    let x = csv.parse(rawCsv);
    this.exoplanetHeaders = x.shift();
    this.exoplanetTable = x;

    if(this.store.getState().worldSettings.starfieldReady) {
      this.createStarLookupTable();
    } else {
      let s = document.getElementById('starfield').addEventListener('starfieldReady', this.createStarLookupTable.bind(this))
    }
  },
  createStarLookupTable: function() {
    console.log(`Starfield and exoplanets databases ready.`);
    let s = [];
    this.exoplanetTable.map( p => {
      let i = parseInt(p[this.exoplanetHeaders.indexOf('hip_name')].split(' ')[1]);
      let sid = this.starfield.components.starfield.starIdLookup[i];
      // console.log(i, sid);
      if(sid !== undefined && this.starfield.components.starfield.getStarData(sid) !== undefined) {
        if(s.indexOf(sid) === -1) {
          s.push(sid);
        }
      }
    })
    this.store.dispatch({
      type: 'CREATE_STAR_SET',
      key: 'exoplanets',
      starset: s
    })
  },
  // returns a given starID's exoplanet, or false
  getExoplanet: function(id) {
    // find the first planet who's hipparcos id matches
    let p = this.exoplanetTable.find( s => {
      let exHip = parseInt(s[this.exoplanetHeaders.indexOf('hip_name')].split(' ')[1]);
      let sHip = this.starfield.components.starfield.starIdLookup[exHip];
      return id == exHip
    });

    // console.log(p, id);
    if(p !== undefined) {

      let pOut = {};

      this.exoplanetHeaders.map( (k, i) => {
        pOut[k] = p[i];
      })

      return pOut
    } else {
      return false
    }

  }
});
