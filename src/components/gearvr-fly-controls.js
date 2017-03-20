/* globals AFRAME THREE */
AFRAME.registerComponent('gearvr-fly-controls', {
  schema: {
    active: {type: 'boolean', default: false},
    direction: {type: 'float', default: 0.0}
  },

  init: function () {

    this.handleControlChange = this.handleControlChange.bind(this);

    this.hand = document.getElementById('right-hand');
    // this.hand.addEventListener('trackpadup', (evt) => { this.handleControlChange(false, evt) });
    // this.hand.addEventListener('trackpaddown', (evt) => { this.handleControlChange(true, evt) });

    this.hand.addEventListener('axismove', (evt) => {
      this.handleControlChange(evt.detail.axis[0], evt);
    })

    this.cursor = document.getElementById('acursor');

    this.tick = this.tick.bind(this);
    this.direction = new THREE.Vector3(0, 0, 1);
    this.speed = .05;
  },

  handleControlChange(state, evt) {
    this.data.active = state !== 0;
    this.data.direction = -state;
    this.cursor.setAttribute('material', 'color', state ? "#ff6600" : "#ffffff" );
    // console.log(evt.detail.axis);
  },

  update: function () {

  },

  tick: function(time, timeDelta) {
    if(this.data.active) {
      this.direction.set(0,0,1);
      this.direction.applyQuaternion(this.el.object3D.quaternion);
      this.el.object3D.position.sub(this.direction.multiplyScalar(this.speed*this.data.direction));
      let p = this.el.object3D.position;
      this.el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
    }
  }

});
