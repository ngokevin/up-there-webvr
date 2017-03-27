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
      this.ready = true;

      // lists of entities
      this.spawnQueue = [];
      this.despawnQueue = [];
      this.active = [];
    },
    getStarsInRange() {
      console.log(this.starfield.components.starfield.getStarsNearWorldLocation(this.target.object3D.getWorldPosition()));
    },
    update: function() {
      this.target = document.getElementById(this.data.target);
    },
    tick: function() {
      if(this.pool === undefined) {
        this.pool = this.el.sceneEl.components.pool__star;
      }
      // console.log("spawner");
      // debugger;
      if(this.ready === true && this.pool !== undefined) {
        if(this.el.children.length < this.data.maxStars) {
          let c = this.pool.requestEntity();
          if(c === undefined) return;
          // c.setAttribute('position', `${Math.random()-.5} ${Math.random()-.5} ${Math.random()-.5}`)
          this.el.appendChild(c);
          this.getStarsInRange();
        } else {
          let c = this.el.children[Math.floor(Math.random() * this.el.children.length)];
          this.el.removeChild(c);
          this.pool.returnEntity(c)
        }
        // debugger;

        // debugger;
      }
    }
  });
