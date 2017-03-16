varying vec2 vUv;
varying float vCi;

attribute float absmag;
attribute float ci;

void main() {
  vUv = uv;
  vCi = ci;
  gl_PointSize = absmag;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
