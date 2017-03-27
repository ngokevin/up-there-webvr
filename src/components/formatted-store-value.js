const UPDATE_CURSOR_POSITION = 'UPDATE_CURSOR_POSITION'

  // updates a redux store item to store a vector representing the local position of the cursor's world location
  AFRAME.registerComponent('formattedstorevalue', {
    schema: {
      formattedStringFunc: { type: 'string', default: "(s) => parseFloat(s).toFixed(4)"},
      formattedString: { type: 'string', default: ""},
      storePath: { type: 'string', default: ""},
      targetAttribute: { type: 'string', default: "text.value"},
      storeTemp: { type: 'string', default: ""}
    },
    init: function() {
      this.store = this.el.sceneEl.systems.redux.store;

      // setup a ghost attribute to be updated by redux
      this.update = this.update.bind(this);
      //eval(this.data.formattedStringFunc)(eval(`this.store.getState().${storePath}`))
      let x = {}
      // this.el.setAttribute('redux-bind', this.data.storePath, "formattedstorevalue.storeTemp" );
    },
    update: function(oldData) {
      // console.log("UPDATE", oldData, this.data);
      this.el.setAttribute("text", "value", eval(this.data.formattedStringFunc)(this.data.storeTemp));
      // this.el.setAttribute('text', 'value', )
    }
  });
