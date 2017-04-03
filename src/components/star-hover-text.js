// dispatches an action on click events
AFRAME.registerComponent('star-hover-text', {
  schema: { type: 'int', default: -1},
  init: function() {
    // this.el.classList.add('hoverable');
    // this.stardb = document.getElementById('starNames');
    this.el.parentEl.addEventListener('mouseenter', this.setText.bind(this))
    this.el.parentEl.addEventListener('mouseleave', this.clearText.bind(this))
    // debugger;
  },
  setText: function(evt) {
    let el = evt.detail.intersectedEl;
    let text = el.getAttribute('hover-text');
    debugger;
    if(text !== undefined) {
      this.el.setAttribute('text', 'value', text);
    } else {
      this.el.setAttribute('text', 'value', '');
    }
  },
  clearText: function(evt) {
    this.el.setAttribute('text', 'value', '');
  }
});
