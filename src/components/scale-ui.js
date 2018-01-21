const IDLE = 'IDLE'
    , ACTIVE = 'ACTIVE';
var debounce = require('debounce');

/* globals AFRAME THREE */
AFRAME.registerComponent('scale-ui', {
  schema: {
    start: {type: 'vec3', default: '0 0 0'},
    startDistance: {type: 'float', default: 0},
    startScale: {type: 'float', default: 1.0},
    active: {type: 'boolean', default: false},
    state: {type: 'string', default: IDLE}
  },

  init: function () {

    // Control mechanisms for motion controllers
    this.hands = [
      document.getElementById('right-hand'),
      document.getElementById('left-hand')
    ];

    this.handStates = [
      false,
      false
    ]

    this.keyState = {
      zoomIn: false,
      zoomOut: false
    }

    this.hands.map( (h,i) => {
      h.addEventListener('buttonchanged', (evt) => {
        if(evt.detail.id === 0) {
          this.handleHandChange(i, evt.detail.state.value);
        }
      })
    })

    this.handleKeyChange = this.handleKeyChange.bind(this);

    // Control mechanisms for keyboard
    document.addEventListener('keydown', (evt) => { this.handleKeyChange(evt.code, true); });
    document.addEventListener('keyup', (evt) => { this.handleKeyChange(evt.code, false); });

    this.data.startScale = this.el.getAttribute('scale').x;
    this.tick = this.tick.bind(this);

    this.dbUpdate = debounce(this.updateState, 200);
  },

  handleKeyChange(code, state) {
    switch(code) {
      case 'KeyZ':
        this.keyState.zoomIn = state;
        break;
      case 'KeyX':
        this.keyState.zoomOut = state;
        break;
    }
  },

  handleHandChange(hand, value) {
    this.handStates[hand] = value;
  },

  update: function () {

  },

  getHandVectorPositions: function() {
    let rpos = this.hands[0].getAttribute('position');
    let lpos = this.hands[1].getAttribute('position');

    return [rpos,lpos].map( hp => {
      return new THREE.Vector3(hp.x, hp.y, hp.z);
    });
  },

  setState: function(state) {
    if(this.data.state !== state) {
      this.data.state = state;
      this.el.emit('stateChanged', state);
    }
  },

  getHandsCenterpoint: function() {
    if(this.scratch === undefined) {
      this.scratch = {};
      this.scratch.h0 = new THREE.Vector3();
      this.scratch.h1 = new THREE.Vector3();
    }


    let rpos = this.hands[0].getAttribute('position');
    let lpos = this.hands[1].getAttribute('position');

    this.scratch.h0.set(rpos.x, rpos.y, rpos.z);
    this.scratch.h1.set(lpos.x, lpos.y, lpos.z);


    // midpoint, in vec3 form
    return this.scratch.h0.add(this.scratch.h1).divideScalar(2).clone();
  },

  getHandsDistance: function() {
    let rpos = this.hands[0].getAttribute('position');
    let lpos = this.hands[1].getAttribute('position');

    this.scratch.h0.set(rpos.x, rpos.y, rpos.z);
    this.scratch.h1.set(lpos.x, lpos.y, lpos.z);


    return this.scratch.h0.distanceTo(this.scratch.h1);
  },

  updateState: function() {
    switch(this.data.state) {
      case IDLE:
        // if we're idle and both hands are active
        if(this.handStates[0] && this.handStates[1]) {
          // get the current centerpoint for zooming between the two hands
          this.el.setAttribute('scale-ui', 'start', this.getHandsCenterpoint())
          this.el.setAttribute('scale-ui', 'startDistance', this.getHandsDistance())
          this.data.startScale = this.el.getAttribute('scale').x;
          this.setState(ACTIVE);
        }
        break;
      case ACTIVE:
        if(!this.handStates[0] || !this.handStates[1]) {
          this.setState(IDLE);
        } else {
          let s = (this.getHandsDistance() / this.data.startDistance) * this.data.startScale;
          this.el.setAttribute('scale', `${s} ${s} ${s}`);
        }
        break;
    }

    if(this.keyState.zoomIn) {
      let s = this.el.getAttribute('scale').x * 1.01;
      this.el.setAttribute('scale', `${s} ${s} ${s}`);
    } else if(this.keyState.zoomOut) {
      let s = this.el.getAttribute('scale').x * .99;
      this.el.setAttribute('scale', `${s} ${s} ${s}`);
    }
  },

  tick: function(time, timeDelta) {
    this.updateState();
  }

});
