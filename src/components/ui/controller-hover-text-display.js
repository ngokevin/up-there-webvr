AFRAME.registerComponent('controller-hover-text-display', {
  init: function () {
    var el = this.el;

    el.setAttribute('text', 'value', '');
    el.getObject3D('text').position.y += 0.02;
    el.getObject3D('text').position.z -= 0.02;

    el.addEventListener('mouseenter', evt => {
      el.setAttribute('text', 'value',
                      evt.detail.intersectedEl.getAttribute('hover-text') || '');
    });

    el.addEventListener('mouseleave', evt => {
      el.setAttribute('text', 'value', '');
    });
  }
});
