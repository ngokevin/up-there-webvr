varying vec2 vUv;
varying float vCi;

attribute float absmag;
attribute float ci;

void main() {
  vUv = uv;
  vCi = ci;
  gl_PointSize = mix(5.0, 1.0, min(1.,((5. + absmag) / 4.) ) );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
