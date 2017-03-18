/* globals AFRAME THREE */
AFRAME.registerComponent('gearvr-fly-controls', {
  schema: {
    active: {type: 'boolean', default: false}
  },

  init: function () {

    this.handleControlChange = this.handleControlChange.bind(this);

    this.hand = document.getElementById('right-hand');
    this.hand.addEventListener('trackpadup', (evt) => { this.handleControlChange(false, evt) });
    this.hand.addEventListener('trackpaddown', (evt) => { this.handleControlChange(true, evt) });

    this.cursor = document.getElementById('acursor');

    this.tick = this.tick.bind(this);
    this.direction = new THREE.Vector3(0, 0, 1);
    this.speed = .01;
  },

  handleControlChange(state, evt) {
    this.data.active = state;
    this.cursor.setAttribute('material', 'color', state ? "#ff6600" : "#ffffff" );
    console.log(evt);
  },

  update: function () {

  },

  tick: function(time, timeDelta) {
    if(this.data.active) {
      this.direction.set(0,0,1);
      this.direction.applyQuaternion(this.el.object3D.quaternion);
      this.el.object3D.position.sub(this.direction.multiplyScalar(this.speed));
      let p = this.el.object3D.position;
      this.el.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
    }
  }

});
