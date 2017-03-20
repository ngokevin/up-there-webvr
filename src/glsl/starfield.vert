// uniform vec3 cameraPosition;
#pragma glslify: blackbody = require("glsl-colormap/blackbody")

varying vec2 vUv;
varying vec4 starColor;

attribute float absmag;
attribute float ci;

void main() {
  vUv = uv;
  starColor = blackbody(ci / 10000.);
  gl_PointSize = max(1.0, 15.0/distance(position, cameraPosition));
  // gl_PointSize *= (1.0 - absmag)
  // gl_PointSize *= max(1.0, (1.44 + max(-1.0, absmag/55.0)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
