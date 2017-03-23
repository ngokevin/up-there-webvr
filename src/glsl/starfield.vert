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
  gl_PointSize = min(200.0, max(0.0, 1.0/pow(distance(position, cameraPosition), 2.0)) + max(1.0, starScale));
  vPointSize = gl_PointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
