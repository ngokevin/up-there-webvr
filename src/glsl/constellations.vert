// uniform vec3 cameraPosition;
uniform float starfieldScale;
uniform float uStarfieldTime;

varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

attribute float absmag;
attribute float ci;
attribute float starScale;
attribute vec4 starColor;
attribute vec3 velocity;

void main() {
  vUv = uv;
  vStarColor = starColor;
  gl_PointSize = min(201.0, max(0.0, 1.0/pow(distance(position, cameraPosition), 2.0)) + max(1.0, starScale));
  vPointSize = gl_PointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position + (velocity * uStarfieldTime), 1.0 );
}
