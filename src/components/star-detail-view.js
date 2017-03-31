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


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* globals AFRAME THREE */
AFRAME.registerComponent('star-detail-view', {
  schema: {
    selectedStar: { type: 'int', default: -1 },
    star: {
      name: "Not known. Not known.",
      position: { x: 0, y: 0, z: 0 },
      classification: "?'s'",
      distance: 0.0
    }
  },

  init: function () {
    this.starfield = document.getElementById('starfield');
  },

  getExoplanets: function(id) {
    return this.el.sceneEl.systems.exoplanet.getExoplanets(id);
  },
  formatDistance: function(distParsecs) {

    let out = "";

    let distLy = distParsecs * PARSEC_TO_LY;
    if(distLy < .8) {
      out = `${Math.round((distLy * LY_TO_KM)/1e6)} million km`;
    } else if(distLy < 10) {
      out = `${distLy.toFixed(1)} lightyears`;
    } else if(distLy < 1000){
      out = `${Math.round(distLy)} lightyears`
    } else {
      out = `${numberWithCommas(Math.round(distLy))} lightyears`
    }

    return out;
  },
  // returns a formatted radius in the proper units
  formatRadius: function(radiusSols) {
    let out = "";
    let radiusKm = radiusSols * SOL_TO_KM;

    if(radiusKm < 1e6) {
      out = `${numberWithCommas(Math.round(radiusKm))} km`;
    } else if(radiusKm < 1e9) {
      out = `${(radiusKm / 1e6).toFixed(1)} million km`;
    } else {
      out = `${(radiusKm / 1e9).toFixed(1)} billion km`;
    }
    return out;
  },
  formatStarName: function(name) {
    if(name === 'U') {
      return 'Unnamed';
    } else {
      return name;
    }
  },
  updateStarDetailFields: function() {
    // update detail view position
    let star = this.starfield.components.starfield.getStarData(this.data.selectedStar);
    let starName = this.formatStarName(this.starfield.components.starfield.starnames[this.data.selectedStar]);

    // console.log(star, starName)
    this.el.setAttribute('sol-scale', star.radius);
    let newStar = {};

    newStar.name = starName
    newStar.radius = this.formatRadius(star.radius);
    newStar.radiusSols = star.radius;
    newStar.temp = `${numberWithCommas(star.temp)}° K`;
    let p = new THREE.Vector3(star.position.x, star.position.y, star.position.z);
    newStar.distance = this.formatDistance(p.distanceTo(new THREE.Vector3(0,0,0)));

    let color = new THREE.Color(star.color.x, star.color.y, star.color.z);
    newStar.color = color.getHexString();
    this.el.setAttribute('material', 'color', `#${newStar.color}`);

    newStar.id = `ID: HD ${star.id}`;
    newStar.dbKey = this.data.selectedStar;

    let planetCount = this.getExoplanets(star.id).length;
    newStar.exoplanets = this.getExoplanets(star.id);//`${planetCount} planet${planetCount == 1 ? '' : 's'}`;

    this.el.sceneEl.systems.redux.store.dispatch({
      type: 'STAR_DETAILS',
      val: newStar
    })
  },
  update: function(oldData) {
    if(this.data.selectedStar !== oldData.selectedStar) {
      // going into detail view mode
      if(this.data.selectedStar > -1) {



        // centralize formatting here for the detail view rather than making a million separate
        // components for each value
        this.updateStarDetailFields();

        // update detail view scale
        // this.el.setAttribute('visible', 'true');


      // leaving detail view mode
      } else {
        // this.el.setAttribute('visible', 'false');
      }
    }
  }
});
