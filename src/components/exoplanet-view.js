// a few astronomical constants that are handy
const SOL_TO_KM = 695700
    , PARSEC_TO_KM = 3.086e13
    , KM_TO_PARSEC = 1/PARSEC_TO_KM
    , PARSEC_TO_LY = 3.26156
    , LY_TO_PARSEC = 1 / PARSEC_TO_LY
    , LY_TO_KM = LY_TO_PARSEC * PARSEC_TO_KM
    , AU_TO_PARSEC = 4.84814e-6
    , PARSEC_TO_AU = 1 / AU_TO_PARSEC
    , AU_TO_KM = AU_TO_PARSEC * PARSEC_TO_KM
    , SOL_TO_PARSECS = SOL_TO_KM * KM_TO_PARSEC


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* globals AFRAME THREE */
AFRAME.registerComponent('exoplanet-view', {
  schema: {
    planetId: { type: 'int', default: -1 },
    systemScale: { type: 'float', default: 1.0 }
  },
  init: function () {
    this.starfield = document.getElementById('starfield');
  },
  update: function() {
    console.log(`System scale: ${this.data.systemScale}.`)
    if(this.data.planetId > -1) {
      this.planetDef = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails.exoplanets[this.data.planetId];
      if(this.planetDef !== undefined) {
        // calculate the diameter of the orbit
        this.starDef = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails;
        let scale = document.getElementById('star-detail-view').getAttribute('scale');

        // calculate the units-to-parsecs ratio
        // let UNITS_TO_PARSECS = (this.starDef.radiusSols * SOL_TO_PARSECS);
        // let AU_PER_UNIT = UNITS_TO_PARSECS * PARSEC_TO_AU;
        // let orbitWidth = this.planetDef.pl_orbsmax / AU_PER_UNIT;
        let orbitRadius = this.planetDef.pl_orbsmax * AU_TO_PARSEC;
        console.log(`Setting planet ${this.data.planetId} with a radius of ${orbitRadius} (${this.planetDef.pl_orbsmax}) parsecs to ${orbitRadius*this.data.systemScale} units.`);

        // set the inner radius to the proper scale
        this.el.setAttribute('geometry', 'radiusInner', (orbitRadius * this.data.systemScale));
        this.el.setAttribute('geometry', 'radiusOuter', (orbitRadius * this.data.systemScale) + .025);

        // console.log(`${UNITS_TO_PARSECS} parsecs in a single unit, the ${this.planetDef.pl_orbsmax} AU orbit is ${orbitWidth} scaled`);

      }
    }
  }
});
