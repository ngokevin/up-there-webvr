// uniform vec3 cameraPosition;
#pragma glslify: blackbody = require("glsl-colormap/blackbody")
#pragma glslify: scaleLog = require("glsl-scale-log")

varying vec2 vUv;
varying vec4 starColor;

attribute float absmag;
attribute float ci;

void main() {
  vUv = uv;
  starColor = blackbody(ci / 10000.);
  // float m = 1.0 - ((1.7 + absmag) / 25.);
  gl_PointSize = min(10.0, 4.0 * (1.0 - scaleLog(100.0, max(0.0, absmag), vec2(0., 15.))));
  gl_PointSize = max(0.0, 15.0/distance(position, cameraPosition)) + gl_PointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
