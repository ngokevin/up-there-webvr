// uniform vec3 cameraPosition;
uniform float starfieldScale;
uniform float uStarfieldTime;
uniform float uTime;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}
