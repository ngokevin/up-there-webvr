#pragma glslify: blackbody = require("glsl-colormap/blackbody")
varying vec2 vUv;
varying vec4 starColor;

uniform sampler2D starDecal;

void main() {
  gl_FragColor = texture2D(starDecal, gl_PointCoord) * vec4(starColor.xyz, 1.0);//blackbody(vCi / 10000.);
}
