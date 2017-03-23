#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

varying vec2 vUv;
varying vec4 vStarColor;
varying float vPointSize;

uniform sampler2D starDecal;
uniform sampler2D sphereMask;
uniform float uTime;
uniform float uDetailDrawDistance;

vec4 starSurface() {
    // return vec4( vStarColor.rgb * vec3(snoise3(vec3(gl_PointCoord * 10., uTime * .0005)) * .5 + .5), 1.);
    // float n2 = snoise3(vec3(gl_PointCoord * 25., uTime * .00075)) + .75;
    // float n3 = snoise3(vec3(gl_PointCoord * 100., uTime * .00125)) * -.25;
    // vec2 d = normalize(gl_PointCoord - vec2(.5, .5));//vec2(.5) - gl_PointCoord;
    // float n1 = snoise3( vec3( vec2(gl_PointCoord * 10.), uTime * .0005));
    // return vec4( n1, n1, n1, 1.0);
    // return vec4(vStarColor.rgb * (n1+n2+(n3-.5)), 1.0);

    vec2 p = -1.0 + 2.0 * gl_PointCoord.xy;
    float r = sqrt(dot(p,p));
    if (r < 1.0)
    {
      vec2 uv;
      vec2 uv2;
      float f = (1.0-sqrt(1.0-r))/(r);
      uv.x = (p.x * 1.5)*f;
      uv.y = (p.y * 1.5)*f;
      uv2.x = (p.x * 40.)*f;
      uv2.y = (p.y * 40.)*f;
      float t = snoise3( vStarColor.xyz + vec3(uv.xy, uTime * .00005) ) * snoise3( vec3(uv.xy, uTime * -.00025) ) * 2.;
      float y = snoise3( vStarColor.zzy + vec3(uv2.xy, uTime * .00025) );
      return vec4( vec3(t + y), 1.0);
    }

}

void main() {
  if(vPointSize <= 2.5) {
    gl_FragColor = vStarColor;
  } else if(vPointSize < uDetailDrawDistance) {
    gl_FragColor = texture2D(sphereMask, gl_PointCoord) * vStarColor;
    if (gl_FragColor.w < 0.5) discard;
  } else {
    gl_FragColor = texture2D(sphereMask, gl_PointCoord) * vStarColor;
    if (gl_FragColor.w < 0.5) {
      discard;
    } else {
      gl_FragColor = mix(gl_FragColor, starSurface() + vStarColor, 1.0 - min(1.0, uDetailDrawDistance / vPointSize));
    }

  }

}
