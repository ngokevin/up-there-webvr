varying vec4 vStarColor;

attribute vec4 color;

void main() {
  vStarColor = color;
  gl_PointSize = 15.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
