uniform float uStarfieldTime;

varying vec4 vStarColor;

attribute vec4 color;
attribute vec3 velocity;

void main() {
  vStarColor = color;
  vec3 newPos = position + (velocity * uStarfieldTime);
  gl_PointSize = 15.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
}
