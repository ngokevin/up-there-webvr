const SOLS_TO_PARSECS = 2.25461e-8
    , AU_TO_PARSEC = 4.84814e-6;


 AFRAME.registerComponent('star-detail-exoplanet-list', {
   schema: {
     starId: { type: 'int', default: -1 },
   },
   init: function() {
     this.pool = this.el.sceneEl.components.pool__medtext;
     this.starfield = document.getElementById('starfield');
     this.ready = true;
     this.active = [];
     this.spawnPlanets = this.spawnPlanets.bind(this);
     this.clearPlanets = this.clearPlanets.bind(this);
   },
   clearPlanets: function() {
     while(this.active.length > 0) {
       let a = this.active.pop();
       this.el.sceneEl.components.pool__medtext.returnEntity(a);
       a.parentEl.removeChild(a);
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

     sortedPlanets.map( (pDef, i) => {
       let c = this.el.sceneEl.components.pool__medtext.requestEntity();
       c.setAttribute('text', 'value', pDef['pl_name']);
       console.log(`Setting name to ${pDef['pl_name']} on exoplanet...`)
       this.el.appendChild(c);
       this.active.push(c);
     });

   },
   update: function(oldData) {
     this.clearPlanets();
     this.spawnPlanets();
   }
 });
