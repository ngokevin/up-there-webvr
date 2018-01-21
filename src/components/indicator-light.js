
  AFRAME.registerComponent('indicator-light', {
    schema: {
      state: {type: "boolean", default: false},
      target: {type: "string", default: ""},
      offColor: { type: "string", default: "#111111"},
      onColor: { type: "string", default: "#ff4444"}
    },
    init: function() {
        this.target = document.getElementById(this.data.target);
        this.updateState = this.updateState.bind(this);
        this.target.addEventListener('stateUpdated', this.updateState);
    },
    updateState: function(evt) {
    // console.log(state);
      let state = evt.detail;
      this.el.setAttribute('indicator-light', 'state', state === true);
      this.el.emit('stateUpdated', this.data.state);
      this.el.setAttribute('material', 'color', state === true ? this.data.onColor : this.data.offColor );
    }
  });
