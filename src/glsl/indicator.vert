void main() {
  gl_PointSize = 50.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
