// Component to change to random color on click.
AFRAME.registerComponent('follow-entity', {
  schema: {
    target: {type: 'string', default: 'acamera'}
  },
  init: function () {
    this.targetEl = document.getElementById(this.data.target);
    this.velocity = 0.0;
    this.deadZone = 40;
    this.maxVelocity = 4.;
  },
  updateVelocity() {
    let tr = this.targetEl.getAttribute('rotation').y;
    let mr = this.el.getAttribute('rotation').y;
    let dist = tr - mr;
    if(Math.abs(dist) > this.deadZone) {
      let dz = this.deadZone;
      if(dist > 0.) {
        dist -= this.deadZone;
      } else {
        dist += this.deadZone;
      }
      this.velocity = Math.pow(dist, 3.) * .001;
      this.velocity = Math.min(this.maxVelocity, Math.max(-this.maxVelocity, this.velocity));
    } else {
      this.velocity = 0.;
    }
  },
  tick: function() {
    this.el.setAttribute('position', this.targetEl.getAttribute('position'));

    this.updateVelocity();
    this.el.setAttribute('rotation', { y: this.el.getAttribute('rotation').y + this.velocity })
  }
});
