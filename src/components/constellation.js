var Constellation = require('../Constellation')(THREE);
var stardata = require('../../assets/data/stardata.json');

  AFRAME.registerComponent('constellations', {
    schema: {
      time: { type: 'float', default: 0.0 }
    },
    init: function() {
      this.store = this.el.sceneEl.systems.redux.store;
      this.constellationMat = new THREE.ShaderMaterial({
          uniforms: {
            "cameraPosition": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
            "starfieldScale": { type: "f", value: this.el.getAttribute('scale').x },
            "uTime": { type: "f", value: 0.1 },
            "uStarfieldTime": { type: "f", value: 0.0 },
            "uDetailDrawDistance": { type: "f", value: 15.0 }
          },
          vertexShader: require('../glsl/constellations.vert'),
          fragmentShader: require('../glsl/constellations.frag')
        });

      this.starfield = document.getElementById('starfield');

      if(!this.store.getState().worldSettings.starfieldReady) {
        this.unsubscribe = this.store.subscribe(() => { this.storeUpdated() })
      }

      // this.buildGeometry = this.buildGeometry.bind(this);

    },
    storeUpdated() {
      if(this.store.getState().worldSettings.starfieldReady === true) {
        console.log("STARFIELD READY! building constellations...🐪");
        this.unsubscribe();
        // load all constellation verts into a single list
        let geo = this.buildGeometry();
        var mesh = this.el.getOrCreateObject3D('object3D', THREE.Object3D);
        mesh.add( new THREE.LineSegments(geo, this.constellationMat) );
      }
    },
    buildGeometry() {
      var vertArray = [];
      var velArray = [];

      // for each constellation
      Object.keys(stardata).map( c => {
        // and each star id in each constellation
        let v = stardata[c].map( s => {
          // look up the star's position and velocity and toss it into the array
          let i = this.starfield.components.starfield.starIdLookup[s];
          let d = this.starfield.components.starfield.getStarData(i);
          if(d!== undefined) {
            vertArray.push([d.position.x, d.position.y, d.position.z])
            velArray.push([d.velocity.x, d.velocity.y, d.velocity.z])
          } else {
            // debugger;
          }

        })
      });

      // then flatten both arrays of arrays
      vertArray = vertArray.reduce( (a,b) => {
        return a.concat(b);
      });

      // console.log(vertArray);

      velArray = velArray.reduce( (a,b) => {
        return a.concat(b);
      });

      // create some buffer geometry
      var g = new THREE.BufferGeometry();

      // and a few attribute arrays using the bits we calculated above
      var verts = new Float32Array(vertArray);
      var vels = new Float32Array(velArray);

      // add the attributes to the geometry so we can use them in shaders later
      g.addAttribute( 'position', new THREE.BufferAttribute(verts, 3) );
      g.addAttribute( 'velocity', new THREE.BufferAttribute(vels, 3) );

      return g;
    },
    update: function () {
      this.constellationMat.uniforms['uStarfieldTime'].value = this.data.time;
      // debugger;
      // var mesh = this.el.setObject3D('mesh', new Constellation(this.data.name, stardata[this.data.name]));
      // mesh.add(c);
    }
  })
// }
