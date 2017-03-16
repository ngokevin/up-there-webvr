// var stardata = require('../../data/stardata.json')

/* globals AFRAME THREE */
AFRAME.registerComponent('starfield', {
  schema: {
    src: {type: 'asset'}
  },

  init: function () {
    // this.objectLoader = new THREE.ObjectLoader();
    // this.objectLoader.setCrossOrigin('');
    console.log("INIT");
  },

  update: function (oldData) {
    // var self = this;
    fetch(this.data.src)
      .then(function(response) {
        return response.json()
      }).then( (json) => {

        var mesh = new THREE.Object3D();

        for(c in json) {
          let geo = new THREE.BufferGeometry();
          let verts = new Float32Array(json[c]);
          geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
          let m = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x33aaff }));
          mesh.add(m);
        }
        this.el.setObject3D('mesh', mesh);
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      })
    // this.objectLoader.load(this.data.src, function (group) {
    //   var Rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    //   group.traverse(function (child) {
    //     if (!(child instanceof THREE.Mesh)) { return; }
    //     child.position.applyMatrix4(Rotation);
    //   });
    //   self.el.setObject3D('mesh', group);
    //   self.el.emit('model-loaded', {format: 'json', model: group, src: src});
    // });
  }
});
