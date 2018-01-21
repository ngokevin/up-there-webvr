
  AFRAME.registerComponent('button-switch', {
    schema: {
      state: {type: "boolean", default: false},
      morph: {type: "string", default: ""},
      morphValue: {type: "float", default: 0.0},
      isAnimating: {type: "boolean", default: false},
    },
    init: function() {
      // bindings
      this.toggleState = this.toggleState.bind(this);
      this.handleAnimationChange = this.handleAnimationChange.bind(this);
      this.tick = this.tick.bind(this);
      this.el.addEventListener('click', this.handleClick.bind(this));
      this.el.addEventListener('animationstart', (evt) => { this.handleAnimationChange(true); });
      this.el.addEventListener('animationend', (evt) => { this.handleAnimationChange(false); });
      this.el.addEventListener('model-loaded', this.initializeModel.bind(this));
    },
    //{format: 'json', model: group, src: src}
    initializeModel: function(evt) {
      let g = evt.detail.model;
      this.morphObject = g.getObjectByName('Button', true);
    },
    handleAnimationChange: function(state) {
      this.el.setAttribute('button-switch', 'isAnimating', state);
    },
    toggleState: function() {
      this.el.emit('buttonPressed');
    },
    handleClick: function(evt) {
      this.toggleState();
    },
    tick: function() {
      if(this.data.isAnimating && this.data.morph.length > 0) {
        let i = this.morphObject.morphTargetDictionary[this.data.morph];
        this.morphObject.morphTargetInfluences[i] = this.data.morphValue;
      }
    }
  });
