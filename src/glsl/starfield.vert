// uniform vec3 cameraPosition;
uniform float starfieldScale;
uniform float uStarfieldTime;

varying vec4 vStarColor;
varying float vPointSize;

attribute float absmag;
attribute float ci;
attribute float starScale;
attribute vec4 starColor;
attribute vec3 velocity;

void main() {
  vStarColor = starColor;
  vec3 newPos = position + (velocity * uStarfieldTime);
  gl_PointSize = min(21.0, max(0.0, 1.0/pow(distance(newPos, cameraPosition), 2.0)) + max(1.0, starScale));
  // gl_PointSize = max(1.0, starScale);
  vPointSize = gl_PointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0 );
}
