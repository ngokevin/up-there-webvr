var starSets = require('./starSets');

const MOBILE = 'MOBILE'
    , DESKTOP = 'DESKTOP'
    , RIFT = 'RIFT'
    , VIVE = 'VIVE'
    , GEARVR = 'GEARVR'
    , DAYDREAM = 'DAYDREAM'
    , CARDBOARD = 'CARDBOARD';

const STARDATA_NEW = 'STARDATA_NEW';
const STARDATA_BUILDING = 'STARDATA_BUILDING';
const STARDATA_READY = 'STARDATA_READY';

const MACRO_VIEW = 'MACRO_VIEW'
    , DETAIL_VIEW = 'DETAIL_VIEW';

var reducer = module.exports = {
  actions: {
    SCALE_DOWN: 'SCALE_DOWN',
    SCALE_UP: 'SCALE_UP',
    SPEED_DOWN: 'SPEED_DOWN',
    SPEED_UP: 'SPEED_UP',
    TIME_DOWN: 'TIME_DOWN',
    TIME_UP: 'TIME_UP',
    STARFIELD_READY: 'STARFIELD_READY',
    UPDATE_CURSOR_POSITION: 'UPDATE_CURSOR_POSITION',
    SELECT_STAR: 'SELECT_STAR',
    SELECT_PLANET: 'SELECT_PLANET',
    SELECT_PANEL: 'SELECT_PANEL',
    HOVER_STAR: 'HOVER_STAR',
    SET_BUSY: 'SET_BUSY',
    SET_LOADING: 'SET_LOADING',
    STAR_COUNT: 'STAR_COUNT',
    RECORD_COUNT: 'RECORD_COUNT',
    PROCESSING_RATE: 'PROCESSING_RATE',
    HOVER_TEXT: 'HOVER_TEXT',
    STAR_DETAILS: 'STAR_DETAILS',
    SET_INPUT_ACTIVE: 'SET_INPUT_ACTIVE',
    SET_SYSTEM_TYPE: 'SET_SYSTEM_TYPE',
    SET_CONTROL_TYPE: 'SET_CONTROL_TYPE',
    SET_VR_SYSTEM: 'SET_VR_SYSTEM',
    SET_SUN_INDICATOR: 'SET_SUN_INDICATOR',
    SET_STAR_DATA_STATE: 'SET_STAR_DATA_STATE',
    SET_ZOOM_LEVEL: 'SET_ZOOM_LEVEL',


    // STAR_SET MODIFIERS
    SELECT_STAR_SET: 'SELECT_STAR_SET',
    CREATE_STAR_SET: 'CREATE_STAR_SET',
    DELETE_STAR_SET: 'DELETE_STAR_SET'
  },

  initialState: {
    scale: .0005,
    speed: 50,
    time: 0,
    starDataState: STARDATA_NEW,
    currentStarSet: false,
    starfieldReady: false,
    selectedStar: -1,
    selectedPanel: -1,
    zoomLevel: MACRO_VIEW,
    hoverStar: 0,
    hoverText: "",
    starName: "Unknown",
    systemType: MOBILE,
    sunIndicator: false,
    starCount: 0,
    recordCount: 0,
    hoverColor: "#4499ff",
    inputActive: {
      fly: false,
      click: false,
      time: false
    },
    starDetails: {
      name: "Sol",
      radius: 12.01,
      temperature: 5800,
      position: { x: 0, y: 0, z: 0},
      mass: 1,
      starType: 'Dwarf',
      starClass: 'V',
      distance: 1,
      distanceParsecs: 1.3,
      hexColor: 1,
      id: 1,
      dbKey: -1,
      exoplanets: [
      {
        hip_name:"HIP 0",
        pl_bmassj:"2.56E-03",
        pl_bmassprov:"",
        pl_dens:"",
        pl_letter:"c",
        pl_name:"Venus",
        pl_orbeccen:"",
        pl_orbincl:"",
        pl_orbper:"224.7",
        pl_orbsmax:"0.7232620321",
        pl_radj:"0.08465282829",
        rowid:"1112"
      },{
        hip_name:"HIP 0",
        pl_bmassj:"1.74E-04",
        pl_bmassprov:"",
        pl_dens:"",
        pl_letter:"b",
        pl_name:"Mercury",
        pl_orbeccen:"",
        pl_orbincl:"",
        pl_orbper:"87.97",
        pl_orbsmax:"0.3870989305",
        pl_radj:"0.03412969283",
        rowid:"1111"
      },
      {
      hip_name:"HIP 0",
      pl_bmassj:"3.14E-03",
      pl_bmassprov:"",
      pl_dens:"",
      pl_letter:"d",
      pl_name:"Earth",
      pl_orbeccen:"",
      pl_orbincl:"",
      pl_orbper:"365.26",
      pl_orbsmax:"1",
      pl_radj:"0.08921277905",
      rowid:"1113",
      },{
      hip_name:"HIP 0",
      pl_bmassj:"3.38E-04",
      pl_bmassprov:"",
      pl_dens:"",
      pl_letter:"e",
      pl_name:"Mars",
      pl_orbeccen:"",
      pl_orbincl:"",
      pl_orbper:"686.98",
      pl_orbsmax:"1.523663102",
      pl_radj:"0.04751580596",
      rowid:"1114",
      },{
      hip_name:"HIP 0",
      pl_bmassj:"3.38E-04",
      pl_bmassprov:"",
      pl_dens:"",
      pl_letter:"f",
      pl_name:"Jupiter",
      pl_orbeccen:"",
      pl_orbincl:"",
      pl_orbper:"4332.71",
      pl_orbsmax:"5.202740642",
      pl_radj:"1",
      rowid:"1115",
    },
    {
    hip_name:"HIP 0",
    pl_bmassj:"2.99E-01",
    pl_bmassprov:"",
    pl_dens:"",
    pl_letter:"g",
    pl_name:"Saturn",
    pl_orbeccen:"",
    pl_orbincl:"",
    pl_orbper:"10759.5",
    pl_orbsmax:"9.554812834",
    pl_radj:"0.843003413",
    rowid:"1116"
  },
    {
    hip_name: "HIP 0",
    pl_bmassj: "5.37E-02",
    pl_bmassprov: "",
    pl_dens: "",
    pl_letter: "i",
    pl_name: "Neptune",
    pl_orbeccen: "",
    pl_orbincl: "",
    pl_orbper: "60190",
    pl_orbsmax: "30.10895722",
    pl_radj: "0.3464163823",
    rowid: "1118"
},{
  hip_name:"HIP 0",
  pl_bmassj:"4.57E-02",
  pl_bmassprov:"",
  pl_dens:"",
  pl_letter:"h",
  pl_name:"Uranus",
  pl_orbeccen:"",
  pl_orbincl:"",
  pl_orbper:"30685",
  pl_orbsmax:"19.19110963",
  pl_radj:"0.3575085324",
  rowid:"1117"
}
  ],
      exoplanetDetails: {
        name: "Unknown",
        distance: "dist",
        period: "per",
        radius: "radius",
        mass: "mass"
      },
      exoplanetCount: 0
    },
    ui: {
      selectedStar: -1,
      hoverStar: -1,
      selectedPlanet: -1,
      hoverPlanet: -1,
      selectedPanel: '',
      hoverPanel: -1
    },
    starSets: {},
    processingRate: 512,
    busy: true,
    loading: true,
    cursorPosition: { x: 0, y: 0, z: 0 },
    minScale: .001,
    minSpeed: 1,
    vrSystem: false
  },

  reducer: function (state, action) {
    state = state || this.initialState;
    switch (action.type) {


      case this.actions.SET_ZOOM_LEVEL: {
        var newState = Object.assign({}, state);
        newState.zoomLevel = action.value;
        return newState;
      }

      case this.actions.SET_STAR_DATA_STATE: {
        var newState = Object.assign({}, state);
        newState.starDataState = action.value;
        return newState;
      }

      case this.actions.SELECT_PANEL: {
        var newState = Object.assign({}, state);
        if(action.value !== undefined) {
          newState.ui.selectedPanel = action.value;
        } else {
          newState.ui.selectedPanel = '';
        }
        console.log(`Updated panel to ${action.value}`)
        return newState;
      }

      case this.actions.SELECT_PLANET: {
        var newState = Object.assign({}, state);
        if(action.value !== undefined && !isNaN(parseInt(action.value))) {
          newState.ui.hoverPlanet = parseInt(action.value);
        } else {
          newState.ui.hoverPlanet = -1;
        }
        return newState;
      }

      case this.actions.SET_SYSTEM_TYPE: {
        var newState = Object.assign({}, state);
        if(action.value !== undefined) {
          newState.systemType = action.value;
        }
        return newState;
      }

      case this.actions.SET_SUN_INDICATOR: {
        var newState = Object.assign({}, state);
        if(action.value == true) {
          newState.sunIndicator = action.value;
        } else {
          newState.sunIndicator = false;
        }
        return newState;
      }

      case this.actions.SET_VR_SYSTEM: {
        var newState = Object.assign({}, state);
        if(action.value !== undefined) {
          newState.vrSystem = action.value;
        }
        return newState;
      }

      case this.actions.SET_INPUT_ACTIVE: {
        var newState = Object.assign({}, state);
        newState.inputActive = Object.assign({}, newState.inputActive, action.inputs);
        return newState;
      }

      case this.actions.SELECT_STAR_SET: {
        var newState = Object.assign({}, state);
        if(newState.starSets[action.value] !== undefined) {
          newState.currentStarSet = action.value;
        } else {
          newState.currentStarSet = false;
        }
        return newState;
      }

      case this.actions.DELETE_STAR_SET:
      case this.actions.CREATE_STAR_SET:
        var newState = Object.assign({}, state);
        newState.starSets = starSets(state.starSets, action);
        return newState;


      case this.actions.STAR_DETAILS: {
        var newState = Object.assign({}, state);
        newState.starDetails = Object.assign({}, newState.starDetails, action.value);
        return newState;
      }

      case this.actions.HOVER_TEXT: {
        var newState = Object.assign({}, state);
        newState.hoverText = action.val;
        return newState;
      }

      case this.actions.PROCESSING_RATE: {
        var newState = Object.assign({}, state);
        newState.processingRate = action.val;
        return newState;
      }

      case this.actions.STAR_COUNT: {
        var newState = Object.assign({}, state);
        newState.starCount = action.val;
        return newState;
      }

      case this.actions.SET_CURSOR: {
        var newState = Object.assign({}, state);
        newState.cursorVisible = action.val;
        return newState;
      }

      case this.actions.RECORD_COUNT: {
        var newState = Object.assign({}, state);
        newState.recordCount = action.val;
        return newState;
      }

      case this.actions.SET_BUSY: {
        var newState = Object.assign({}, state);
        if(action.val == 'true') {
          newState.busy = true;
        } else {
          newState.busy = false;
        }
        return newState;
      }

      case this.actions.SET_LOADING: {
        var newState = Object.assign({}, state);
        if(action.val == 'true') {
          newState.busy = true;
        } else {
          newState.busy = false;
        }
        return newState;
      }

      case this.actions.HOVER_STAR: {
        var newState = Object.assign({}, state);
        if(action.id === undefined) {
          newState.hoverStar = -1;
        } else {
          newState.hoverStar = parseInt(action.id);
        }
        return newState;
      }

      case this.actions.SELECT_STAR: {
        var newState = Object.assign({}, state);
        if(action.value === undefined || isNaN(parseInt(action.value))) {
          newState.ui.selectedStar = -1;
        } else {
          newState.ui.selectedStar = parseInt(action.value);
        }
        return newState;
      }

      case this.actions.UPDATE_CURSOR_POSITION: {
        var newState = Object.assign({}, state);
        newState.cursorPosition = Object.assign({}, newState.cursorPosition, action.position);
        return newState;
      }

      case this.actions.STARFIELD_READY: {
        var newState = Object.assign({}, state);
        newState.starfieldReady = true;
        return newState;
      }

      case this.actions.TIME_UP: {
        var newState = Object.assign({}, state);
        newState.time += 1000;
        return newState;
      }
      case this.actions.TIME_DOWN: {
        var newState = Object.assign({}, state);
        newState.time -= 1000;
        return newState;
      }

      case this.actions.SCALE_UP: {
        var newState = Object.assign({}, state);
        newState.scale *= 10;
        return newState;
      }
      case this.actions.SCALE_DOWN: {
        var newState = Object.assign({}, state);
        newState.scale = Math.max(newState.minScale, newState.scale * .1);
        return newState;
      }

      case this.actions.SPEED_UP: {
        var newState = Object.assign({}, state);
        if(newState.speed === 1) {
          newState.speed = 10;
        } else {
          newState.speed += 10;
        }
        return newState;
      }
      case this.actions.SPEED_DOWN: {
        var newState = Object.assign({}, state);
        newState.speed -= 10;
        newState.speed = Math.max(1., newState.speed);
        return newState;
      }


      default: {
        return state;
      }
    }
  }
};

try {
  if(AFRAME !== undefined) {
    AFRAME.registerReducer('worldSettings', reducer);
  }
} catch(e) {

}
