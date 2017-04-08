varying vec2 vUv;

uniform sampler2D noise1;
uniform sampler2D noise2;
uniform vec4 uStarColor;
uniform float uTime;
uniform float uDetailDrawDistance;

void main() {
  float bright = texture2D(noise1, (vUv + vec2(0.0, uTime * .0001)) * vec2(1.0, .43)).r;
  bright *= vUv.y * (texture2D(noise1, (vUv + vec2(0.0, uTime * .0000155)) * vec2(1.0, .13)).g) * 4.0;
  // bright = 1.0 - bright;
  float alpha = texture2D(noise1, (vUv* vec2(2.0, .3)) - vec2(0.0, uTime *-.00014)).b;
  // gl_FragColor = uStarColor * vec4( vec3((bright) * 5.0 * max(0.0, vUv.y - .1)), 1.0);
  bright *= vUv.y;
  gl_FragColor = uStarColor * vec4( vec3(bright) - (alpha*.2), 1.0 );
}
