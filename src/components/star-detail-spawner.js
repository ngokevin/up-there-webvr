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
      target: {type: 'string', default: 'acursor'},
      maxStars: { type: 'int', default: 10 },
      mixin: { type: 'string', default: 'wirecube'},
      radius: { type: 'float', default: 2 },
      selectedStar: { type: 'int', default: -1 },
      starfieldReady: { type: 'boolean', default: false }
    },
    init: function() {
      this.pool = this.el.sceneEl.components.pool__star;
      this.tick = AFRAME.utils.throttleTick(this.throttledTick, 250, this);
      this.starfield = document.getElementById('starfield');
      // this.starDB = this.starfield.components.starfield.starDB;
      this.ready = true;

      // lists of entities
      // this.spawnQueue = [];
      // this.despawnQueue = [];
      this.active = [];
      this.entities = [];
    },
    getStarsInRange() {
      return this.starfield.components.starfield.getStarsNearWorldLocation(this.target.object3D.getWorldPosition(), this.data.radius);
    },
    update: function() {
      this.target = document.getElementById(this.data.target);
      if(this.data.selectedStar >= 0) {
        this.el.setAttribute('visible', 'false');
      } else {
        setTimeout( () => {
          this.el.setAttribute('visible', 'true');
        }, 1100);

      }
    },
    throttledTick: function() {
      if(!this.data.starfieldReady) return;

      if(this.pool === undefined) {
        this.pool = this.el.sceneEl.components.pool__star;
      }

      if(this.target != null && this.ready === true && this.pool !== undefined) {
        var stars = this.getStarsInRange();
        // debugger;
        // this.starDB = this.starfield.components.starfield.starDB;
        if(stars.length > 0) {
          // debugger;
          stars.map( id => {
            // if the star is brand new, spawn a marker for it
            if(this.active.indexOf(id) === -1) {
              let c = this.pool.requestEntity();

              c.classList.add('clickable');
              c.classList.add('hoverable');
              let p = this.starfield.components.starfield.getStarPosition(id);
              c.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
              c.setAttribute('id', `star_${id}`);
              c.setAttribute('reticle', 'starId', id);
              this.active.push(id);
              this.entities.push(c);
              this.el.appendChild(c);
            }
          });
        }

        // otherwise, if a star is no longer in range, remove it and return it to the object pool
        this.active = this.active.filter( (id) => {
          if(stars.indexOf(id) === -1) {
            var c = this.entities.find( e => e.getAttribute('id') === `star_${id}` );
            if(c !== undefined) {
              try {
                c.setAttribute('id', 'dead')
                c.classList.remove('clickable')
                this.pool.returnEntity(c);
              } catch(e) {
                // debugger;
                console.log(`Can't remove ${id} entity`, c);
              }
            }
            return false;
          }
          return true;
        })

      }
    }
  });
