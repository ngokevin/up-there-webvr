// uniform vec3 cameraPosition;
#pragma glslify: blackbody = require("glsl-colormap/blackbody")

varying vec2 vUv;
varying vec4 starColor;

attribute float absmag;
attribute float ci;

void main() {
  vUv = uv;
  starColor = blackbody(ci / 10000.);
  gl_PointSize = mix(5.0, 1.0, min(1.,((5. + absmag) / 4.) ) );
  gl_PointSize = max(1.0, gl_PointSize * (50.0/distance(position, cameraPosition / .1)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
