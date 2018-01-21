
var csv = require('csv-string');

const SELECT_STAR = 'SELECT_STAR';

/* globals AFRAME */
AFRAME.registerSystem('exoplanet', {
  init: function () {
    this.exoplanetsDB = document.getElementById('exoplanets');
    this.starfield = document.getElementById('starfield');
    this.exoplanetIdTable = [];
    // window.scene = this.sceneEl;

    window.store = this.store = this.sceneEl.systems.redux.store;
    if(this.exoplanetsDB.hasLoaded) {
      this.processExoplanetsDb();
      // don't auto-update the camera matrix, seems to cut down on some unneccessary processing
      this.sceneEl.camera.matrixAutoUpdate = false;
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
      let sid = this.sceneEl.systems['star-data'].starIdLookup[i];

    if(sid !== undefined && this.sceneEl.systems['star-data'].getStarData(sid) !== undefined) {
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
  getExoplanet: function(planetLetter) {

  },
  // returns a given starID's exoplanet, or false
  getExoplanets: function(id) {

    // find all the planets who's hipparcos id matches
    let p = this.exoplanetTable.filter( s => {
      let exHip = parseInt(s[this.exoplanetHeaders.indexOf('hip_name')].split(' ')[1]);
      let sHip = this.sceneEl.systems['star-data'].starIdLookup[exHip];
      return id == exHip
    });

    // console.log(p, id);
    if(p !== undefined && p.length > 0) {
      let pOut = p.map( exo => {
        let obj = {};

        this.exoplanetHeaders.map( (k, i) => {
          obj[k] = exo[i];
        });
        return obj;
      })
      return pOut
    } else {
      return []
    }

  }
});
