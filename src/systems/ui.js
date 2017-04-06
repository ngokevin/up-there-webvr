// The UI system detects what kind of capabilities your system has and spawns
// appropriate UI components for those systems

/* globals AFRAME */
AFRAME.registerSystem('ui', {
  init: function () {
    console.log("🙉 UI system started.")
    this.graphicsSettings();
  },
  graphicsSettings: function() {
    if(!AFRAME.utils.device.isMobile()) {
      this.sceneEl.setAttribute('antialias', 'true');
    }
  },
  controlSettings: function() {

    if(AFRAME.utils.device.isGearVR()) {

      // set VR system to GEARVR, and let components do the rest?
      this.el.sceneEl.systems.redux.store.dispatch({
        type: 'SET_VR_SYSTEM',
        value: 'GEARVR'
      });

    }
  }
});
