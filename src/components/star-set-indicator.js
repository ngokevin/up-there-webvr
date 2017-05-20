

// dispatches an action on click events
AFRAME.registerComponent('star-set-indicator', {
  schema: {
    currentStarSet: { type: 'string', default: 'false'},
    selectedStar: { type: 'int', default: -1 },
    time: { type: 'float', default: 0 }
  },
  init: function() {
    // starfield
    this.starfield = document.getElementById('starfield')
    this.store = this.el.sceneEl.systems.redux.store;

    // initialize some geometry
    this.geo = new THREE.BufferGeometry();
    this.maxIndicators = 512;

    // create attribute buffers for our indicator geometry
    var verts = new Float32Array(this.maxIndicators*3);
    var color = new Float32Array(this.maxIndicators*4);

    [verts, color].map( a => {
      for(let i = 0; i < a.length; i++) {
        a[i] = 0.0;
      }
    });

    this.geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    this.geo.addAttribute( 'color', new THREE.BufferAttribute(color, 4) );

    // initialize the material
    this.mat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "decal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/indicator.png" ) },
          "uTime": { type: "f", value: 0.1 },
          "uStarfieldTime": { type: "f", value: 0.0 }
        },
        vertexShader: require('../glsl/indicator.vert'),
        fragmentShader: require('../glsl/indicator.frag'),
        transparent: true
      });

    let mesh = new THREE.Points(this.geo, this.mat);
    mesh.name = 'mesh';
    mesh.frustrumCulled = false;
    this.el.setObject3D('mesh', mesh);
    this.update();
  },
  maskStar: function(id, mask) {
    let o = this.el.object3D.getObjectByName('mesh');
    let sid = this.store.getState().worldSettings.starSets[this.data.currentStarSet].indexOf(id);
    console.log(`🚗 ${sid}`);
    o.geometry.attributes.color.setW(sid, parseFloat(mask));
    o.geometry.attributes.color.needsUpdate = true;
  },
  update: function(oldData) {
    if(this.data.currentStarSet != 'false'
      && oldData
      && this.data.selectedStar !== oldData.selectedStar
      && (this.store.getState().worldSettings.starSets[this.data.currentStarSet].indexOf(this.data.selectedStar) !== -1 || this.store.getState().worldSettings.starSets[this.data.currentStarSet].indexOf(oldData.selectedStar) !== -1)
    ) {
      // this.mat.uniforms['uStarfieldTime'].value = this.data.time;
      // if transitioning in, mask selected star
      if(this.data.selectedStar > -1) {
        this.maskStar(this.data.selectedStar, 0);
      // otherwise if transitioning out, unmask the star from oldData
      } else {
        setTimeout(() => {
          this.maskStar(oldData.selectedStar, 1);
        }, 1100);

      }
      console.log(`🥑 You've selected a star that is in the current star set!`)
    }
    if(this.data.currentStarSet != "false" && oldData && oldData.currentStarSet != this.data.currentStarSet) {
      console.log("Rebuiling starset indicator... 🛴");

      let starList = this.store.getState().worldSettings.starSets[this.data.currentStarSet];

      console.log(`Building ${starList.length} stars... 🌋`);

      // create attribute buffers for our indicator geometry
      var verts = new Float32Array(starList.length * 3);
      var color = new Float32Array(starList.length * 4);

      starList.map( (s,i) => {

        let star = this.starfield.components.starfield.getStarData(s);

        verts[(i*3)+0] = star.position.x;
        verts[(i*3)+1] = star.position.y;
        verts[(i*3)+2] = star.position.z;

        color[(i*4+0)] = 1.;// * Math.random();
        color[(i*4+1)] = 1.;// * Math.random();
        color[(i*4+2)] = 1.;// * Math.random();
        color[(i*4+3)] = 1.;// * Math.random();
      })

      this.geo.attributes.position.set(verts);
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.color.set(color);
      this.geo.attributes.color.needsUpdate = true;
      // this.geo.boundingSphere.radius = 1000 + Math.random();
    }
  }
});
