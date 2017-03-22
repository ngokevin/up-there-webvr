// uniform vec3 cameraPosition;
uniform float starfieldScale;

varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

attribute float absmag;
attribute float ci;
attribute float starScale;
attribute vec4 starColor;

void main() {
  vUv = uv;
  vStarColor = starColor;
  gl_PointSize = max(1.0, starScale);
  gl_PointSize = max(0.0, 15.0/distance(position, cameraPosition)) + gl_PointSize;
  vPointSize = gl_PointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
