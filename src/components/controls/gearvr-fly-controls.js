var debounce = require('debounce');

// These controls use the forward/back swipe on the GearVR to fly around,
// and also currently handles clicks too, which maybe it shouldn't? There are
// also lots of calculations in here for flying at a particular warp speed, as
// defined by TNG conventions (speed = w^(10/3)*c), assuming a global scale of
// one world unit per one parsec. You have to be somewhere in the high double-
// digit warp levels to get anywhere before your phone's battery dies, so I
// default it around there.

/* globals AFRAME THREE */
AFRAME.registerComponent('gearvr-fly-controls', {
  schema: {
    active: {type: 'boolean', default: false},
    direction: {type: 'float', default: 0.0},
    warpSpeed: {type: 'float', default: 1.0},
    speed: {type: 'float', default: 60.0}
  },

  init: function () {

    if(!AFRAME.utils.device.isGearVR) {
      return;
    }

    this.cursor = document.getElementById('acursor');
    this.hand = document.getElementById('right-hand');
    this.handleClick = this.handleClick.bind(this);
    this.dbClick = debounce(this.handleClick, 200, true);
    this.gearVRInitialized = false;

    if(AFRAME.utils.device.isMobile()) {
      this.el.sceneEl.addEventListener('enter-vr', () => {
        console.log("🐋 Entering VR.")
        navigator.getVRDisplays()
          .then( e => {
            // if we are on a mobile device that is not a gearVR, enable fusing
            if(e.length > 0 && e[0].displayName.indexOf("GearVR") == -1) {
              this.cursor.setAttribute('cursor', 'fuse', 'true');
            } else {
              this.cursor.setAttribute('cursor', 'fuse', 'false');
              if(!this.gearVRInitialized) {
                this.gearVRInitialized = true;
                this.hand.addEventListener('buttonchanged', (evt) => {
                  if(evt.detail.state.pressed == true) {
                    this.dbClick();
                  }
                })
              }

            }
          })
          .catch( e => {
            console.log("👎 VR DETECTION ERROR ")
            console.log(e)
          })
      })

    }

    this.handleControlChange = this.handleControlChange.bind(this);

    this.hand.addEventListener('axismove', (evt) => {
      this.handleControlChange(evt.detail.axis[0], evt);
    })

    this.cursor = document.getElementById('acursor');

    this.tick = this.tick.bind(this);

    this.direction = new THREE.Vector3(0, 0, 1);
    this.parsecsPerSecond = 9.71561e-9;

    this.setWarpSpeed(this.data.speed);

  },
  setEventListeners: function(onOff) {
    if(onOff) {

    } else {

    }
  },
  setWarpSpeed: function(warpLevel) {
    let vel = Math.pow(warpLevel, 10/3); // velocity as a multiple of the speed of light
    this.data.warpSpeed = vel * this.parsecsPerSecond; // speed = parsecs per second at current warp level
  },

  handleControlChange(state, evt) {
    if(this.data.active !== (state !== 0)) {
      this.data.active = state !== 0;
      this.data.direction = -state;
      this.cursor.setAttribute('material', 'color', state ? "#ff6600" : "#ffffff" );
    }
  },
  handleClick: function() {
    this.cursor.components.cursor.onMouseDown();
    this.cursor.components.cursor.onMouseUp();
  },
  update: function (oldData) {
    // console.log('old', oldData);
    // console.log('new', this.data);
    if(this.data.warpSpeed !== oldData.warpSpeed) {
      this.setWarpSpeed(this.data.speed);
      // console.log('warp', this.data.warpSpeed);
    }
    // this.data = Object.assign({}, oldData, { warpSpeed: this.data.warpSpeed });
    // if(this.data.active !== oldData.active) {
    //   console.log(`Active: ${this.data.active}`);
    // }
  },
  // play: function () {
  //   var el = this.el;
  //   el.addEventListener('buttonchanged', this.onButtonChanged);
  //   el.addEventListener('buttondown', this.onButtonDown);
  //   el.addEventListener('buttonup', this.onButtonUp);
  //   el.addEventListener('model-loaded', this.onModelLoaded);
  // },
  //
  // pause: function () {
  //   var el = this.el;
  //   el.removeEventListener('buttonchanged', this.onButtonChanged);
  //   el.removeEventListener('buttondown', this.onButtonDown);
  //   el.removeEventListener('buttonup', this.onButtonUp);
  //   el.removeEventListener('model-loaded', this.onModelLoaded);
  // },
  tick: function(time, timeDelta) {
    if(this.data.active) {
      this.direction.set(0,0,1); // start with a normalized forward vector
      this.direction.applyQuaternion(this.el.object3D.quaternion);
      this.el.object3D.position.sub(this.direction.multiplyScalar((timeDelta*this.data.warpSpeed)*this.data.direction));
      let p = this.el.object3D.position;
      this.el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
    }
  }

});
