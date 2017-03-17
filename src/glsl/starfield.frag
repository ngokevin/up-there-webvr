#pragma glslify: blackbody = require("glsl-colormap/blackbody")
varying vec2 vUv;
varying float vCi;

void main() {
  gl_FragColor = blackbody(vCi / 10000.);
}
