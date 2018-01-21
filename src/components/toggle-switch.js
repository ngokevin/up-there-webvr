
  AFRAME.registerComponent('toggle-switch', {
    schema: {
      state: {type: "boolean", default: false},
      morph: {type: "string", default: ""},
      morphValue: {type: "float", default: 0.0},
      isAnimating: {type: "boolean", default: false}
    },
    init: function() {
      // bindings
      this.toggleState = this.toggleState.bind(this);
      this.handleAnimationChange = this.handleAnimationChange.bind(this);
      this.el.addEventListener('click', this.handleClick.bind(this));
      this.el.addEventListener('animationstart', (evt) => { this.handleAnimationChange(true); });
      this.el.addEventListener('animationend', (evt) => { this.handleAnimationChange(false); });
      this.tick = this.tick.bind(this);
    },
    handleAnimationChange: function(state) {
      this.el.setAttribute('toggle-switch', 'isAnimating', state);
    },
    toggleState: function() {
      this.el.setAttribute('toggle-switch', 'state', !this.data.state);
      this.el.emit('stateUpdated', this.data.state);
    },
    handleClick: function(evt) {
      this.toggleState();
    },
    tick: function() {
      if(this.data.isAnimating && this.data.morph.length > 0) {
        let i = this.el.object3D.children[0].morphTargetDictionary[this.data.morph];
        this.el.object3D.children[0].morphTargetInfluences[i] = this.data.morphValue;
      }
    }
  });
