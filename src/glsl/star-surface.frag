#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
varying vec2 vUv;

uniform float uTime;
uniform vec4 uStarColor;

void main() {
  float n1 = snoise3(vec3(vUv.xy * 10., uTime * .00005)) * .5 + .5;
  float n2 = snoise3(vec3(vUv.xy * 75., uTime * .00025)) + .75;
  float n3 = snoise3(vec3(vUv.xy * 500., uTime * .00125)) * -.25;
  // float n4 = snoise3(vec3(vUv.xy * 2500., uTime * .00125)) * -.5;
  gl_FragColor = uStarColor * (n1+n2+(n3-.5));
}
