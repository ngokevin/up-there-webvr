#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
varying vec2 vUv;

uniform float uTime;
uniform vec4 uStarColor;

void main() {
  float n1 = snoise3(vec3(vUv.xy * 15., uTime * .00005)) * .5 + .5;
  float n2 = snoise3(vec3(vUv.xy * 50., uTime * .00025)) + .75;
  gl_FragColor = uStarColor * (n1+n2);
}
