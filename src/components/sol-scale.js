const SOLS_TO_PARSECS = 2.25461e-8;

/* globals AFRAME THREE */
AFRAME.registerComponent('sol-scale', {
  schema: { type: 'float', default: 1 }, // radius in sols
  init: function() {
    this.update = this.update.bind(this);
  },
  update: function () {
    // calculate scale based on sol radius
    let pr = this.data * SOLS_TO_PARSECS;
    this.el.setAttribute('scale', `${pr} ${pr} ${pr}`);
    // console.log(pr);
  }
});
