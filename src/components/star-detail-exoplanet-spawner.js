const SOLS_TO_PARSECS = 2.25461e-8;


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
     console.log(p);
     p.map( (pDef, i) => {
       let c = this.el.sceneEl.components.pool__exoplanet.requestEntity();
       c.setAttribute('exoplanet-view', i);
       console.log(`Setting ${i} key on exoplanet...`)
       this.el.appendChild(c);
       this.active.push(c);
     });
     console.log(`Spawned ${p.length} planets...`);
   },
   update: function(oldData) {
     console.log(this.data, oldData);
     this.clearPlanets();
     this.spawnPlanets();
   }
 });
