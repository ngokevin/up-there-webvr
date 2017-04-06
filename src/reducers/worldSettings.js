var starSets = require('./starSets');

const MOBILE = 'MOBILE'
    , DESKTOP = 'DESKTOP'
    , RIFT = 'RIFT'
    , VIVE = 'VIVE'
    , GEARVR = 'GEARVR'
    , DAYDREAM = 'DAYDREAM'
    , CARDBOARD = 'CARDBOARD'

AFRAME.registerReducer('worldSettings', {
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
    HOVER_STAR: 'HOVER_STAR',
    SET_BUSY: 'SET_BUSY',
    SET_LOADING: 'SET_LOADING',
    STAR_COUNT: 'STAR_COUNT',
    PROCESSING_RATE: 'PROCESSING_RATE',
    HOVER_TEXT: 'HOVER_TEXT',
    STAR_DETAILS: 'STAR_DETAILS',
    SET_INPUT_ACTIVE: 'SET_INPUT_ACTIVE',
    SET_SYSTEM_TYPE: 'SET_SYSTEM_TYPE',
    SET_CONTROL_TYPE: 'SET_CONTROL_TYPE',
    SET_VR_SYSTEM: 'SET_VR_SYSTEM',
    SET_SUN_INDICATOR: 'SET_SUN_INDICATOR',

    // STAR_SET MODIFIERS
    SELECT_STAR_SET: 'SELECT_STAR_SET',
    CREATE_STAR_SET: 'CREATE_STAR_SET',
    DELETE_STAR_SET: 'DELETE_STAR_SET'
  },

  initialState: {
    scale: .0005,
    speed: 50,
    time: 0,
    currentStarSet: false,
    starfieldReady: false,
    selectedStar: -1,
    hoverStar: 0,
    hoverText: "",
    starName: "Unknown",
    systemType: MOBILE,
    sunIndicator: false,
    starCount: 0,
    hoverColor: "#4499ff",
    inputActive: {
      fly: false,
      click: false,
      time: false
    },
    starDetails: {
      name: "Unknown",
      radius: "",
      temp: "",
      distance: "",
      distanceParsecs: 1.3,
      hexColor: "",
      id: "",
      dbKey: -1,
      exoplanets: [],
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
      hoverPlanet: -1
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
        newState.starDetails = Object.assign({}, newState.starDetails, action.val);
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
          newState.selectedStar = -1;
        } else {
          newState.selectedStar = parseInt(action.value);
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
});
