const SOLS_TO_PARSECS = 2.25461e-8
    , AU_TO_PARSEC = 4.84814e-6;


 AFRAME.registerComponent('star-detail-exoplanet-spawner', {
   schema: {
     starId: { type: 'int', default: -1 },
   },
   init: function() {
     this.pool = this.el.sceneEl.components.pool__exoplanet;
     this.starfield = document.getElementById('starfield');
     this.ready = true;
     console.log(`Exoplanet spawner 🚀`);
     this.active = [];
     this.spawnPlanets = this.spawnPlanets.bind(this);
     this.clearPlanets = this.clearPlanets.bind(this);
   },
   clearPlanets: function() {
     while(this.active.length > 0) {
       this.el.sceneEl.components.pool__exoplanet.returnEntity(this.active.pop());
     }
   },
   spawnPlanets: function() {
     let p = this.el.sceneEl.systems.redux.store.getState().worldSettings.starDetails.exoplanets;

     // skip if there are no exoplanets
     if(p.length <= 0) {
       return;
     }

     // if the star has exoplanets, scale it to comfortably fit all of their orbits
     let sortedPlanets = p.sort( (a,b) => {
       return parseFloat(a.pl_orbsmax) - parseFloat(b.pl_orbsmax);
     })

     // the scale in parsecs of the largest orbit
     if(sortedPlanets[sortedPlanets.length-1].pl_orbsmax !== '') {
       parsecsScale = parseFloat(sortedPlanets[sortedPlanets.length-1].pl_orbsmax) * AU_TO_PARSEC;
     // or default to 1 AU
     } else {
       parsecsScale = 1 * AU_TO_PARSEC;
     }


     // calculate the scale value for that orbital radius to give it a real world scale of 1
     let systemScale = 1.0 / parsecsScale;

     console.log(`🌎 Star system is ${parsecsScale} across, ${systemScale} ratio`)

     p.map( (pDef, i) => {
       let c = this.el.sceneEl.components.pool__exoplanet.requestEntity();
       c.setAttribute('exoplanet-view', 'planetId', i);
       c.setAttribute('exoplanet-view', 'systemScale', systemScale);

       this.el.appendChild(c);
       this.active.push(c);
     });

   },
   update: function(oldData) {
     console.log(this.data, oldData);
     this.clearPlanets();
     this.spawnPlanets();
   }
 });
