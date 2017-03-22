varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

uniform sampler2D starDecal;

void main() {
  if(vPointSize > 1.0) {
    gl_FragColor = texture2D(starDecal, gl_PointCoord) * vStarColor;
  } else {
    gl_FragColor = vStarColor;//texture2D(starDecal, gl_PointCoord) * vStarColor;
  }

}
