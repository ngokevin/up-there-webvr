const SOLS_TO_PARSECS = 2.25461e-8
    , AU_TO_PARSEC = 4.84814e-6;


 AFRAME.registerComponent('star-detail-exoplanet-detail', {
   schema: {
     hoverPlanet: { type: 'int', default: -1 },
     selectedStar: { type: 'int', default: -1 }
   },
   init: function() {
     this.starfield = document.getElementById('starfield');
   },
   update: function(oldData) {
     if(this.data.selectedStar !== oldData.selectedStar && this.data.selectedStar < 0) {
       this.el.sceneEl.systems.redux.store.dispatch({
         type: 'SELECT_PLANET',
         val: -1
       })
     }
     if(oldData.hoverPlanet !== this.data.hoverPlanet) {
       if(this.data.hoverPlanet < 0) {
        this.el.setAttribute('visible', 'false');
       } else {
        // get details on the current planet
        let s = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails;
        let p = s.exoplanets[this.data.hoverPlanet];

        let fields = ['pl_radj', 'pl_bmassj', 'pl_orbper', 'pl_orbsmax']

        // format the radius
        let radius = p['pl_radj'];

        if(radius !== '') {
          radius = `${parseFloat(radius).toFixed(2)} x Jupiter`
        } else {
          radius = 'Unknown.'
        }

        // format the mass
        let mass = p['pl_bmassj'];

        if(mass !== '') {
          mass = `${parseFloat(mass).toFixed(2)} x Jupiter`
        } else {
          mass = 'Unknown.'
        }

        // format string versions of the variables for our ui
        let exoplanetDetails = {
          name: `Name: ${p['pl_name']}`,
          distance: `Orbital Dist: ${parseFloat(p['pl_orbsmax']).toFixed(2)} AU`,
          period: `Year length: ${parseFloat(p['pl_orbper']).toFixed(2)} days`,
          radius: `Radius: ${radius}`,
          mass: `Mass: ${mass}`,
        };

        this.el.sceneEl.systems.redux.store.dispatch({
          type: 'STAR_DETAILS',
          val: {
            exoplanetDetails: exoplanetDetails
          }
        })

        this.el.setAttribute('visible', 'true');
       }

     }
   }
 });
