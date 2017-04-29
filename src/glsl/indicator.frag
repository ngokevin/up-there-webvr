varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

uniform sampler2D decal;
uniform float uTime;

void main() {
  gl_FragColor = texture2D(decal, gl_PointCoord) * vStarColor * 3.5;
  if(gl_FragColor.w < .1) discard;
}
