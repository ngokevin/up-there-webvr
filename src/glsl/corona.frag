varying vec2 vUv;

uniform sampler2D noise1;
uniform sampler2D noise2;
uniform vec4 uStarColor;
uniform float uTime;
uniform float uDetailDrawDistance;

void main() {
  float bright = texture2D(noise1, vUv * vec2(1.0, .124) + vec2(0.0, uTime * 3e-6)).r;
  float displacement = texture2D(noise2, vUv * vec2(2.0, .14) + vec2(0.0, uTime * 3.2e-5)).g;
  float b = (bright + displacement) * 1.3 * pow(vUv.y, 1.75);
  gl_FragColor = uStarColor * vec4(b,b,b,1.0);
}
