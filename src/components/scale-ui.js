const IDLE = 'IDLE'
    , ACTIVE = 'ACTIVE';


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
    this.hands = [
      document.getElementById('right-hand'),
      document.getElementById('left-hand')
    ];

    this.handStates = [
      false,
      false
    ]

    this.hands.map( (h,i) => {
      h.addEventListener('buttonchanged', (evt) => {
        if(evt.detail.id === 0) {
          this.handleHandChange(i, evt.detail.state.value);
        }
      })
    })

    this.data.startScale = this.el.getAttribute('scale').x;

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
    let rpos = this.hands[0].getAttribute('position');
    let lpos = this.hands[1].getAttribute('position');

    let vecPositions = [rpos,lpos].map( hp => {
      return new THREE.Vector3(hp.x, hp.y, hp.z);
    });

    // midpoint, in vec3 form
    return new THREE.Vector3().addVectors(vecPositions[0], vecPositions[1]).divideScalar(2);
  },

  getHandsDistance: function() {
    let hands = this.getHandVectorPositions();

    return hands[0].distanceTo(hands[1]);
  },

  tick: function(time, timeDelta) {
    // debugger;
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
          console.log(s);
        }
        break;
    }
  }

});
