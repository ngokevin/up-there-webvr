const UPDATE_CURSOR_POSITION = 'UPDATE_CURSOR_POSITION'

  // updates a redux store item to store a vector representing the local position of the cursor's world location
  AFRAME.registerComponent('sync-local-location', {
    schema: {
      targetLocal: { type: 'string', value: 'starfield' },
      targetWorld: { type: 'string', value: 'acamera' },
      targetReducer: { type: 'string', value: 'worldSettings.absoluteCursorPos'},
      lastPosition: { type: 'vec3', value: "0 0 0"},
      ready: { type: 'boolean', value: false}
    },
    init: function() {
      this.store = this.el.sceneEl.systems.redux.store;
      this.targetWorld = this.el;
      this.targetLocal = document.getElementById('starfield');
      this.tick = this.tick.bind(this);
      this.data.ready = true;
    },
    tick: function() {
      if(this.data.ready === true && this.el.object3D !== undefined && this.targetLocal !== null) {
        let p = this.el.object3D.getWorldPosition();
        let pp = this.targetLocal.object3D.worldToLocal(p);
        this.store.dispatch({
          type: UPDATE_CURSOR_POSITION,
          position: { x: pp.x, y: pp.y, z: pp.z }
        })
      }

    }
  });
