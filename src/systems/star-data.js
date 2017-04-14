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
    tick: { type: 'boolean', default: true },
    dataDownloaded: { type: 'boolean', default: false }
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
    this.totalStarCount = 107643;
    this.starDB = [];
    this.starLocations = [];
    this.starIdLookup = {};
    this.starCount = 0
    this.spawnedStars = 0
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
  getColorForTemp: function(temp) {
    let tempRound = Math.floor((temp/100))*100;
    tempRound = Math.max(1000, Math.min(40000, tempRound));
    let i = Math.floor(tempRound/100) - 10;
      // console.log(i);
    let c = colorTable[i];

    return new THREE.Vector4(c[1], c[2], c[3], 1.0);
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
      p.x = ar[(i * fields.length) + 0];
      p.y = ar[(i * fields.length) + 1];
      p.z = ar[(i * fields.length) + 2];

      // override the sun to perfectly center it
      if(starCount === 0) {
        p.x = 0.0;
        p.y = 0.0;
        p.z = 0.0;
      }

      v.x = ar[(i * fields.length) + 3];
      v.y = ar[(i * fields.length) + 4];
      v.z = ar[(i * fields.length) + 5];

      // precalculate the color of the star based on its temperature
      let c = this.getColorForTemp(ar[(i * fields.length) + 7])

      // build the star record
      starRec.position = Object.assign({}, p);
      starRec.mag = ar[(i * fields.length) + 6];
      starRec.color = c;
      starRec.radius = ar[(i * fields.length) + 8];
      starRec.temp = ar[(i * fields.length) + 7];
      starRec.velocity = Object.assign({}, v);
      starRec.id = ar[(i * fields.length) + 9];

      // add the star to the local spatial hash for fast querying
      let shv = this.addStarToHash(p, this.spawnedStars);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(Object.assign({}, starRec));
      this.starIdLookup[starRec.id] = 0 + this.spawnedStars;

      this.spawnedStars++;
    }

    if(this.spawnedStars > this.spawnLimit) {
      this.updateGeometryAttributes();
      this.spawnLimit += this.rebuildCheckSteps;
    }

  },
  splitPackets: function(packets, maxSize) {

    let splitBuffers = [];

    packets.map( starBuffer => {
      let buff = starBuffer.buf;
      let fields = this.dataFields;
      let starOffset = (starBuffer.offset / 4) / fields.length;
      let starCount = (starBuffer.count / 4) / fields.length;
      let bytesPerStar = 4 * fields.length;

      // in chunks of maxSize items, iterate until we're out of stars
      for(let i = 0; i < starCount; i += maxSize) {

        let b
          , a;

        if(i+maxSize >= starCount) {
          b = Buffer.from(buff, (i*bytesPerStar), (starCount*bytesPerStar) - (i*bytesPerStar))
          a = new Float32Array(buff.buffer, (i*bytesPerStar), (starCount*fields.length) - (i*fields.length))
        } else {
          // b = buff.slice(starBuffer.offset + (i*bytesPerStar), maxSize*bytesPerStar);
          b = Buffer.from(buff, (i*bytesPerStar), maxSize*bytesPerStar)
          a = new Float32Array(buff.buffer, (i*bytesPerStar), maxSize*fields.length)
        }

        splitBuffers.push({
          buf: b,
          arr: a,
          offset: starBuffer.offset + (i*bytesPerStar),
          count: b.length
        });

      }
    })

    return splitBuffers;
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
        let newStars = this.stardataHttpStore.getPackets();

        if(newStars && newStars.length > 0) {
          // console.log("splitting stars", newStars);
          let sStars = this.splitPackets(newStars, 1024);
          this.starDataQueue = this.starDataQueue.concat(sStars);
        } else if(newStars === false) {
          this.data.dataDownloaded = true;
        }

        this.processStarData();

        this.sceneEl.systems.redux.store.dispatch({
          type: 'STAR_COUNT',
          val: this.spawnedStars
        })

        if(this.data.dataDownloaded && this.starDataQueue.length == 0) {
          console.log(`Starfield ready. Processed ${this.spawnedStars} stars 🐝`)
          this.sceneEl.systems.redux.store.dispatch({
            type: 'SET_STAR_DATA_STATE',
            value: STARDATA_READY
          })
        }
        break;
      case STARDATA_READY:
        break;
    }
  }
});
