

// dispatches an action on click events
AFRAME.registerComponent('star-set-indicator', {
  schema: {
    currentStarSet: { type: 'string', default: 'false'},
  },
  init: function() {
    // this.el.classList.add('hoverable');
    this.starfield = document.getElementById('starfield')
    this.store = this.el.sceneEl.systems.redux.store;

    // initialize some geometry
    this.geo = new THREE.BufferGeometry();
    this.maxIndicators = 768;

    // create attribute buffers for our indicator geometry
    var verts = new Float32Array(this.maxIndicators*3);
    var color = new Float32Array(this.maxIndicators*4);

    this.geo.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
    this.geo.addAttribute( 'color', new THREE.BufferAttribute(color, 4) );

    // initialize the material
    this.mat = new THREE.ShaderMaterial({
        uniforms: {
          "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
          "decal": { type: "t", value: new THREE.TextureLoader().load( "assets/images/reticle.png" ) },
          "uTime": { type: "f", value: 0.1 },
          "uStarfieldTime": { type: "f", value: 0.0 }
        },
        vertexShader: require('../glsl/indicator.vert'),
        fragmentShader: require('../glsl/indicator.frag'),
        depthWrite: false,
        depthTest: false,
        transparent: true
      });

    let mesh = new THREE.Points(this.geo, this.mat);
    mesh.frustrumCulled = false;
    this.el.setObject3D('mesh', mesh);

  },
  update: function() {

    if(this.data.currentStarSet != "false") {
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

        color[(i*4+0)] = 1.;
        color[(i*4+1)] = 1.;
        color[(i*4+2)] = 1.;
        color[(i*4+3)] = 1.;
      })

      // console.log(verts);

      this.geo.attributes.position.set(verts);
      this.geo.attributes.position.needsUpdate = true;
      this.geo.attributes.color.set(color);
      this.geo.attributes.color.needsUpdate = true;
      this.geo.boundingSphere.radius = 1000 + Math.random();
    }
  }
});
