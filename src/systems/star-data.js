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

const YEAR_MS = 365.25*24*60*60*1000;

// default star settings
const defaultStar = {
  name: 'Invalid Star',
  stats: {
    starClass: 'Uh Oh',
    starType: 'Whoops!',
    radius: 1.0,
    mass: 1.0,
    temp: 5800,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 }
  },
  planets: []
};

// default planet settings
const defaultPlanet = {
  name: 'Invalid Planet',
  stats: {
    orbitalDistance: 1.0,
    orbitalPeriod: 1.0,
    radius: 1.0,
    mass: 1.0
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
    zoomLevel: { type: 'string', default: '' },
    tick: { type: 'boolean', default: true },
    dataDownloaded: { type: 'boolean', default: false }
  },
  init: function() {

    // DATA LOADING - setup database listeners
    this.starMetaInfo = null;
    Promise.all(this.waitForAssets(['starNames', 'starTypes']))
      .then(v => {
        this.starMetaInfo = {};
        this.starMetaInfo.starNames = v[0];
        this.starMetaInfo.starTypes = v[1];
      })
      .catch(e => {
        console.log(`🌪 star data error: ${e}`)
      });

    // setup HTTP store for stardata.bin
    this.dataFields = ['x','y','z','vx','vy','vz','mag','temp','radius','id','mass'];
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

    // external data asset hash
    this.starmetadata = {}

    // Subscribe to redux store updates
    this.store = this.sceneEl.systems.redux.store;
    this.unsubscribe = this.sceneEl.systems.redux.store.subscribe( this.storeUpdate.bind(this) );
  },
  waitForAssets: function(idList) {
    return idList.map( id => {

      return new Promise( (res, rej) => {

        let el = document.getElementById(id);
        if(el.hasLoaded) {
          res(JSON.parse(THREE.Cache.files[el.getAttribute('src')]));
        } else {
          el.addEventListener('loaded', (evt) => {
            res(JSON.parse(THREE.Cache.files[el.getAttribute('src')]));
          })
        }

      })

    })

  },
  storeUpdate: function(evt) {
    if(this.store.getState().worldSettings.ui.selectedStar !== this.data.selectedStar) {
      this.data.selectedStar = this.store.getState().worldSettings.ui.selectedStar;
      if(this.data.selectedStar > -1) {

        // generate the proper star details and update the store
        let details = this.getStarDetails(this.data.selectedStar);
        this.store.dispatch({
          type: 'STAR_DETAILS',
          value: details
        });

        // once everything is ready, trigger a view change
        this.store.dispatch({
          type: 'SET_ZOOM_LEVEL',
          value: 'DETAIL_VIEW'
        });

      } else {
        // return to the macro view
        this.store.dispatch({
          type: 'SET_ZOOM_LEVEL',
          value: 'MACRO_VIEW'
        });
      }
      let z = this.store.getState().worldSettings.zoomLevel;
      console.log(`🏪 store updated to ${this.data.selectedStar}, ${z}`);
    } else {

    }
  },
  getStarDetails: function(id) {
    let s = this.starDB[id];

    // start with all the data available in our db
    let sd = Object.assign({}, s);

    // lookup star classes and types from dataset
    sd.starClass = this.starMetaInfo.starTypes.starClasses[ this.starMetaInfo.starTypes.starClassValues[id] ];
    sd.starType = this.starMetaInfo.starTypes.starTypes[ this.starMetaInfo.starTypes.starTypeValues[id] ]

    // lookup the star name
    sd.name = this.starMetaInfo.starNames[id];
    return sd;
  },
  getStarPosition: function(id) {
    return this.starDB[id].position;
  },
  // SPATIAL QUERY FUNCTIONS
  getHashKey: function(pos) {
    return `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
  },
  getStarsNearLocation: function(pos) {

    var list = []
      , hashKeys = []
      , h = '';

    for(var x = pos.x - (this.hashResolution * this.hashSearchRadius.x); x <= pos.x + (this.hashResolution * this.hashSearchRadius.x); x += this.hashResolution) {
      for(var y = pos.y - (this.hashResolution * this.hashSearchRadius.y); y <= pos.y + (this.hashResolution * this.hashSearchRadius.y); y += this.hashResolution) {
        for(var z = pos.z - (this.hashResolution * this.hashSearchRadius.z); z <= pos.z + (this.hashResolution * this.hashSearchRadius.z); z += this.hashResolution) {
          let p = { x: x, y: y, z: z };
          h = this.getHashKey(p);
          if(hashKeys.indexOf(p) === -1) {
            hashKeys.push(p);
            if(this.spatialHash[h] !== undefined) {
              list = list.concat(this.spatialHash[h]);
            }
          }
        }
      }
    }

    return list;
  },
  getStarsInRadius: function(pos, radius) {

    var list = []
      , hashKeys = []
      , h = '';

    for(var x = pos.x - (this.hashResolution * radius); x <= pos.x + (this.hashResolution * radius); x += this.hashResolution) {
      for(var y = pos.y - (this.hashResolution * radius); y <= pos.y + (this.hashResolution * radius); y += this.hashResolution) {
        for(var z = pos.z - (this.hashResolution * radius); z <= pos.z + (this.hashResolution * radius); z += this.hashResolution) {
          let p = { x: x, y: y, z: z };
          h = this.getHashKey(p);
          if(hashKeys.indexOf(p) === -1) {
            hashKeys.push(p);
            if(this.spatialHash[h] !== undefined) {
              list = list.concat(this.spatialHash[h]);
            }
          } else {
            // console.log(`dupe! ${h}`)
          }

        }
      }
    }

    return list;
  },
  addStarToHash: function(pos, idx) {
    var h = this.getHashKey(pos);
    if(this.spatialHash[h] === undefined) {
      this.spatialHash[h] = [];
    }
    this.spatialHash[h].push(idx);
    return h
  },

  // STAR FORMATTING FUNCTIONS
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
    var starBuffer = this.starDataQueue.shift();

    if(starBuffer === undefined) return;

    // create a few temp objects to use
    var p = {};
    var v = {};
    var starRec = {};

    // grab some local convenience vars
    var buff = starBuffer.buf;
    var fields = this.dataFields;
    var offset = (starBuffer.offset / 4) / fields.length;
    var ar = starBuffer.arr;
    var c;

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
      c = this.getColorForTemp(ar[(i * fields.length) + 7])

      // build the star record
      starRec.position = Object.assign({}, p);
      starRec.mag = ar[(i * fields.length) + 6];
      starRec.color = c;
      starRec.radius = ar[(i * fields.length) + 8];
      starRec.temp = ar[(i * fields.length) + 7];
      starRec.velocity = Object.assign({}, v);
      starRec.id = ar[(i * fields.length) + 9];
      starRec.mass = ar[(i * fields.length) + 10];

      // add the star to the local spatial hash for fast querying
      this.addStarToHash(p, this.spawnedStars);

      // also add its position to the id lookup array
      this.starLocations.push(Object.assign({}, p));
      this.starDB.push(Object.assign({}, starRec));
      this.starIdLookup[starRec.id] = 0 + this.spawnedStars;

      this.spawnedStars++;
    }

    if(this.spawnedStars > this.spawnLimit) {
      this.spawnLimit += this.rebuildCheckSteps;
    }

  },
  splitPackets: function(packets, maxSize) {

    let splitBuffers = [];

    packets.map( starBuffer => {
      var buff = starBuffer.buf;
      var fields = this.dataFields;
      var starOffset = (starBuffer.offset / 4) / fields.length;
      var starCount = (starBuffer.count / 4) / fields.length;
      var bytesPerStar = 4 * fields.length;

      // in chunks of maxSize items, iterate until we're out of stars
      for(var i = 0; i < starCount; i += maxSize) {

        var b
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

    var s = this.store.getState().worldSettings.starDataState;
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
          let sStars = this.splitPackets(newStars, 1024);
          this.starDataQueue = this.starDataQueue.concat(sStars);
        } else if(newStars === false) {
          this.data.dataDownloaded = true;
        }

        this.processStarData();

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
