varying vec4 vStarColor;

attribute vec4 color;

void main() {
  vStarColor = color;
  gl_PointSize = 50.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
