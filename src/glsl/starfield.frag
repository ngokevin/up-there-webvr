#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

uniform sampler2D starDecal;
uniform float uTime;

vec4 starSurface() {
    float n1 = snoise3(vec3(gl_PointCoord * 10., uTime * .00005)) * .5 + .5;
    float n2 = snoise3(vec3(gl_PointCoord * 75., uTime * .00025)) + .75;
    float n3 = snoise3(vec3(gl_PointCoord * 500., uTime * .00125)) * -.25;
    // float n4 = snoise3(vec3(vUv.xy * 2500., uTime * .00125)) * -.5;
    return vec4(vStarColor.rgb, 1.0) * (n1+n2+(n3-.5));
    // return vec4(1.0);
}

void main() {
  if(vPointSize <= 2.0) {
    gl_FragColor = vStarColor;
  } else if(vPointSize < 8.0 || vPointSize > 40.0) {
    gl_FragColor = texture2D(starDecal, gl_PointCoord) * vStarColor;
  } else {
    gl_FragColor = texture2D(starDecal, gl_PointCoord) * mix(vStarColor, starSurface(), 1.0 - min(1.0, 8.0 / vPointSize));
  }
}
