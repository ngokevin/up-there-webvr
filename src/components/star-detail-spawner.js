 const SOLS_TO_PARSECS = 2.25461e-8;


  AFRAME.registerComponent('star-detail-spawner', {
    schema: {
      target: {type: 'string', default: 'acursor'},
      maxStars: { type: 'int', default: 10 },
      mixin: { type: 'string', default: 'wirecube'},
      radius: { type: 'float', default: 1 }
    },
    init: function() {
      this.pool = this.el.sceneEl.components.pool__star;
      this.tick = this.tick.bind(this);
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
      return this.starfield.components.starfield.getStarsNearWorldLocation(this.target.object3D.getWorldPosition());
    },
    update: function() {
      this.target = document.getElementById(this.data.target);
    },
    tick: function() {
      if(this.pool === undefined) {
        this.pool = this.el.sceneEl.components.pool__star;
      }

      if(this.ready === true && this.pool !== undefined) {
        var stars = this.getStarsInRange();
        // debugger;
        // this.starDB = this.starfield.components.starfield.starDB;
        if(stars.length > 0) {
          console.log(stars);
          stars.map( id => {
            // if the star is brand new, spawn a marker for it
            if(this.active.indexOf(id) === -1) {
              let c = this.pool.requestEntity();
              let p = this.starfield.components.starfield.getStarPosition(id);
              c.setAttribute('position', `${p.x} ${p.y} ${p.z}`);
              c.setAttribute('id', `star_${id}`);
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
                let el = document.getElementById(`star_${id}`);
                el.parentElement.removeChild(el);
                this.pool.returnEntity(c);
                // el.parentEl.removeChild(el);

              } catch(e) {
                debugger;
                console.log(`Can't remove ${id} entity`, c);
                return true;
              }

              console.log(`removed star_${id}`)
            } else {
              console.log('cant find entity', c)
            }
            return false;
          }
          return true;
        })

      }
    }
  });
