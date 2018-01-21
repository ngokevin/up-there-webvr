const SOLS_TO_PARSECS = 2.25461e-8;

 // var mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
 AFRAME.registerShader('placeholder', {
   schema: {
     dashSize: {default: 3},
     lineWidth: {default: 1},
     selectedStar: { type: 'int', default: -1}
   },
   /**
    * `init` used to initialize material. Called once.
    */
   init: function (data) {
     this.material = new THREE.MeshBasicMaterial({ color: 0xff99dd, wireframe: true });
     this.starfield = document.getElementById('starfield')
     this.update(data);  // `update()` currently not called after `init`. (#1834)
   },
   /**
    * `update` used to update the material. Called on initialization and when data updates.
    */
   update: function (data) {
    //  this.material.dashsize = data.dashsize;
    //  this.material.linewidth = data.linewidth;
   }
 });

  AFRAME.registerComponent('star-detail-spawner', {
    schema: {
      target: {type: 'string', default: 'acamera'},
      maxStars: { type: 'int', default: 10 },
      mixin: { type: 'string', default: 'wirecube'},
      radius: { type: 'float', default: 4 },
      starsPerFrame: { type: 'float', default: 3},
      selectedStar: { type: 'int', default: -1 },
      zoomLevel: { type: 'string', default: 'MACRO_VIEW'},
      starfieldReady: { type: 'boolean', default: false },
      time: { type: 'float', default: 0.0 }
    },
    init: function() {
      this.pool = this.el.sceneEl.components.pool__star;
      this.tick = AFRAME.utils.throttleTick(this.throttledTick, 50, this);
      this.starfield = document.getElementById('starfield');

      this.ready = true;
      this.lastPosition = '';
      this.moving = true;
      // lists of entities
      this.pending = [];
      this.active = [];
      this.inactive = [];
      this.entities = [];
    },
    getStarsInRange: function() {
      return this.starfield.components.starfield.getStarsNearWorldLocation(this.target.object3D.getWorldPosition(), this.data.radius);
    },
    update: function(oldData) {
      // hide data when scrolling through time
      // TODO this should probably live on the time updater...?
      if(this.data.time !== oldData.time && this.data.time !== 0) {
        this.el.setAttribute('visible', 'false');
      } else if(this.data.time == 0) {
        this.el.setAttribute('visible', 'true');
      }
      this.target = document.getElementById(this.data.target);
      if(this.data.selectedStar != oldData.selectedStar) {
        if(this.data.selectedStar >= 0) {
          this.el.setAttribute('visible', 'false');
          this.despawnAll();
        } else {
          setTimeout( () => {
            this.el.setAttribute('visible', 'true');
          }, 1100);
        }
      }
    },
    despawnAll: function() {
      this.active = [];
      this.entities.map( c => {
        // c.setAttribute('id', 'dead')
        c.classList.remove('clickable')
        this.pool.returnEntity(c);
      });
      this.entities = [];
    },
    formatStarName: function(name) {
      if(name === 'U') {
        return 'Unnamed';
      } else {
        return name;
      }
    },
    spawnStars: function(count) {
      while(count > 0 && this.pending.length > 0) {
        let id = this.pending.shift();
        this.spawnStar(id);
        count--;
      }
    },
    despawnStar: function(id) {
      var c = this.entities.find( e => e.getAttribute('starid') === `star_${id}` );
      this.entities.splice(this.entities.indexOf(c), 1);
      if(c !== undefined) {
        try {
          c.classList.remove('clickable')
          this.pool.returnEntity(c);
        } catch(e) {
          console.log(`Can't remove ${id} entity`, c);
        }
      }
    },
    spawnStar: function(id) {
      let c = this.pool.requestEntity();
      c.classList.add('clickable');
      let p = this.el.sceneEl.systems['star-data'].getStarPosition(id);
      c.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
      c.setAttribute('starid', `star_${id}`);
      c.setAttribute('action-dispatcher', 'value', parseInt(id));
      c.setAttribute('hover-text', this.formatStarName(this.el.sceneEl.systems['star-data'].getStarDetails(id).name));

      this.active.push(id);

      this.el.appendChild(c);
      this.entities.push(c);
    },
    refreshIndicators: function() {

      var stars = this.getStarsInRange();

      // mark new stars in range as pending
      if(stars.length > 0) {

        stars.map( id => {
          let isPending = this.pending.indexOf(id) !== -1;
          let isActive = this.active.indexOf(id) !== -1;

          // if an in-range star isn't pending or active, mark it pending
          if(isActive) {
            // skip active, in-range stars
          } else if(!isPending) {
            // add in range stars that aren't yet pending
            this.pending.push(id);
          }
        });
      }

      // remove active stars no longer in range
      this.active = this.active.filter( (id) => {
        if(stars.indexOf(id) == -1) {
          this.despawnStar(id);
          return false;
        }
        return true;
      })

      // remove pending stars no longer in range
      this.pending = this.pending.filter( (id) => {
        if(stars.indexOf(id) == -1) {
          return false;
        }
        return true;
      })

    },
    throttledTick: function() {
      if(!this.data.starfieldReady) return;

      if(this.pool === undefined) {
        this.pool = this.el.sceneEl.components.pool__star;
      }

      if(this.target != null && this.ready === true && this.pool !== undefined && this.data.selectedStar == -1) {
        let p = this.target.getAttribute('position');

        let r = Object.keys(p).map( (s,i) => {
            return Math.round(p[s]) === Math.round(this.lastPosition[s]);
        });

        // moving is true if any of the values doesn't equal the last posiition
        let m = r.indexOf(false) !== -1;

        if(this.moving || this.active.length == 0) {
          if(!m) {
            this.moving = false;
            this.refreshIndicators();
            // console.log(`🛑 Stopped moving.`);
          }
        } else {
          if(m) {
            this.refreshIndicators();
            this.moving = true;
            // console.log(`🏁 Started moving.`)
          }
        }

        this.lastPosition = this.target.getAttribute('position');

        // spawn a max of one star per frame
        this.spawnStars(this.data.starsPerFrame);

      }
    }
  });
