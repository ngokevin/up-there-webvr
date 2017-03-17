const IDLE = 'IDLE'
    , ACTIVE = 'ACTIVE';


/* globals AFRAME THREE */
AFRAME.registerComponent('translate-ui', {
  schema: {
    start: {type: 'vec3', default: '0 0 0'},
    startPosition: {type: 'vec3', default: '0 0 0'},
    startScale: {type: 'float', default: 1.0},
    active: {type: 'boolean', default: false},
    activeHand: {type: 'int', default: 0},
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
        if(evt.detail.id === 2) {
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

  getNewPosition: function() {

    if(this.scratch === undefined) {
      this.scratch = {};
      this.scratch.pvec = new THREE.Vector3();

      this.scratch.spvec = new THREE.Vector3();

      this.scratch.diff = new THREE.Vector3();
      this.scratch.cpvec = new THREE.Vector3();
    }

    let p = this.hands[this.data.activeHand].getAttribute('position');
    this.scratch.pvec.set(p.x, p.y, p.z);

    let sp = this.data.start;
    this.scratch.spvec.set(sp.x, sp.y, sp.z);

    let diff = this.scratch.pvec.sub(this.scratch.spvec);

    let cp = this.data.startPosition;
    this.scratch.cpvec.set(cp.x,cp.y,cp.z).add(diff);

    return this.scratch.cpvec.clone();
  },

  tick: function(time, timeDelta) {
    // debugger;
    switch(this.data.state) {
      case IDLE:
        let hid = -1;

        // if we're idle and both hands are active
        if(this.handStates[0]) {
          hid = 0;
        } else if(this.handStates[1]) {
          hid = 1;
        }

        if(hid > -1) {
          this.data.activeHand = hid;
          // get the current centerpoint for zooming between the two hands
          this.el.setAttribute('translate-ui', 'start', this.hands[hid].getAttribute('position'));
          this.data.startPosition = this.el.getAttribute('position');
          this.setState(ACTIVE);
        }
        break;
      case ACTIVE:
        if(!this.handStates[0] && !this.handStates[1]) {
          this.setState(IDLE);
        } else {
          let p = this.getNewPosition();
          this.el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
          // console.log(p);
        }
        break;
    }
  }

});
