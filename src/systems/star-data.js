var fields = ['x','y','z','vx','vy','vz','absmag','temp','radius','id']; // all float32s
var stardata = require('../../assets/data/stardata.json');
var colorTable = require('../colorTable.json');
var HttpStore = require('../HttpStore');

// real simple local memoize function just in case
var memoize = function(fn) {
    var cache = {}
      , fn = fn;

    return function(arg) {
      if(arg in cache) {
        return cache[arg]
      } else {
        return cache[arg] = fn(arg);
      }
    }
}

// Define a few strings for states
const STARFIELD_DIRTY = 'STARFIELD_DIRTY';
const STARFIELD_READY = 'STARFIELD_READY';
const STARFIELD_BUILDING = 'STARFIELD_BUILDING';
const STARFIELD_SCALING = 'STARFIELD_SCALING';
const STARFIELD_DETAIL_VIEW = 'STARFIELD_DETAIL_VIEW';
const STARFIELD_NEW = 'STARFIELD_NEW';

const STARDATA_NEW = 'STARDATA_NEW';
const STARDATA_BUILDING = 'STARDATA_BUILDING';
const STARDATA_READY = 'STARDATA_READY';

/* globals AFRAME */
AFRAME.registerSystem('star-data', {
  schema: {
    selectedStar: { type: 'int', default: -1 },
    tick: { type: 'boolean', default: true }
  },
  init: function() {

    // DATA LOADING - setup database listeners
    this.starnamesEl = document.getElementById('starNames');
    if(this.starnamesEl.hasLoaded) {
      this.starnames = JSON.parse(THREE.Cache.files[this.starnamesEl.getAttribute('src')]);
    } else {
      this.starnamesEl.addEventListener('loaded', (evt) => {
        this.starnames = JSON.parse(THREE.Cache.files[this.starnamesEl.getAttribute('src')]);
      })
    }

    // setup HTTP store for stardata.bin
    this.dataFields = ['x','y','z','vx','vy','vz','mag','temp','radius','id'];
    this.stardataHttpStore = new HttpStore('./assets/data/stardata.bin', this.dataFields.length);

    // SPATIAL HASH
    this.spatialHash = {};
    this.hashResolution = 1.0;
    this.hashSearchRadius = {
      x: 2,
      y: 2,
      z: 2
    };
    this.hashStep = this.hashResolution * this.hashSearchRadius;

    // Data processing queue
    this.starDataQueue = [];

    // Subscribe to redux store updates
    this.store = this.sceneEl.systems.redux.store;
    this.unsubscribe = this.store.subscribe( this.handleUpdate.bind(this) );
  },
  handleUpdate: function(evt) {
    if(this.store.getState().worldSettings.ui.selectedStar !== this.data.selectedStar) {
      this.data.selectedStar = this.store.getState().worldSettings.ui.selectedStar;
      console.log(`🏪 store updated to ${this.data.selectedStar}`);
    } else {

    }
  },
  getHashKey: function(pos) {
    return `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
  },
  addStarToHash: function(pos, idx) {
    let h = this.getHashKey(pos);
    if(this.spatialHash[h] === undefined) {
      this.spatialHash[h] = [];
    }
    this.spatialHash[h].push(idx);
    return h
  },
  processStarData: function() {

    // take the first chunk off the data queue
    let starBuffer = this.starDataQueue.shift();

    if(starBuffer === undefined) return;

    // create a few temp objects to use
    let p = {};
    let v = {};
    let starRec = {};

    // grab some local convenience vars
    let buff = starBuffer.buf;
    let fields = this.dataFields;
    let offset = (starBuffer.offset / 4) / fields.length;
    var ar = starBuffer.arr;

    // calculate the number of stars based on the length of the buffer
    var starCount = ar.length / fields.length;

    // for each star in the buffer
    for(var i = 0; i < starCount; i++) {

      // construct GPU buffers for each value
      p.x = verts[(i * 3) + 0] = ar[(i * fields.length) + 0];
      p.y = verts[(i * 3) + 1] = ar[(i * fields.length) + 1];
      p.z = verts[(i * 3) + 2] = ar[(i * fields.length) + 2];

      // override the sun to perfectly center it
      if(starCount === 0) {
        p.x = verts[(i * 3) + 0] = 0.0;
        p.y = verts[(i * 3) + 1] = 0.0;
        p.z = verts[(i * 3) + 2] = 0.0;
      }

      v.x = velocity[(i * 3) + 0] = ar[(i * fields.length) + 3];
      v.y = velocity[(i * 3) + 1] = ar[(i * fields.length) + 4];
      v.z = velocity[(i * 3) + 2] = ar[(i * fields.length) + 5];

      // precalculate the color of the star based on its temperature
      let c = this.getColorForTemp(ar[(i * fields.length) + 7])
      color[(i * 4) + 0] = Math.min(1, c.x * 1.15);
      color[(i * 4) + 1] = Math.min(1, c.y * 1.15);
      color[(i * 4) + 2] = Math.min(1, c.z * 1.15);
      color[(i * 4) + 3] = c.w;

      // build the star record
      starRec.position = Object.assign({}, p);
      starRec.mag = ar[(i * fields.length) + 6];
      starRec.color = Object.assign({}, c);
      starRec.radius = ar[(i * fields.length) + 8];
      starRec.temp = ar[(i * fields.length) + 7];
      starRec.velocity = Object.assign({}, v);
      starRec.id = ar[(i * fields.length) + 9];

      // add the star to the local spatial hash for fast querying
      let shv = this.addStarToHash(p, this.spawnedStars);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(Object.assign({}, starRec));
      this.starIdLookup[id[i]] = 0 + this.spawnedStars;

      this.spawnedStars++;
    }

    if(this.spawnedStars > this.spawnLimit) {
      this.updateGeometryAttributes();
      this.spawnLimit += this.rebuildCheckSteps;
    }

  },
  // accepts a star id and updates s
  update: function(id) {

  },
  tick: function(time, timeDelta) {
    // skip the loop once things are settled
    if(!this.data.tick) return;

    let s = this.store.getState().worldSettings.starDataState;
    switch(s) {
      case STARDATA_NEW:
        console.log(`Stardata New! Starting to build...`);
        this.store.dispatch({
          type: 'SET_STAR_DATA_STATE',
          value: STARDATA_BUILDING
        })
        break;
      case STARDATA_BUILDING:
        console.log(`Stardata Building!`);
        break;
      case STARDATA_READY:
        console.log(`Stardata Ready!`);
        break;

    }
  }
});
