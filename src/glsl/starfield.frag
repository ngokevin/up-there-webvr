// precision highp vec2;
// #pragma glslify: cnoise2 = require(glsl-noise/classic/2d)
// #pragma glslify: cnoise2 = require(glsl-noise/classic/2d)
// uniform vec2 center;
// uniform float angle;
// uniform float scale;
// uniform float uTime;
// uniform vec2 uAspectRatio;
// uniform vec2 tSize;
// uniform sampler2D tDiffuse;
// uniform sampler2D screenTex;
// uniform sampler2D pixelMasks;
// attribute float ci;

#pragma glslify: blackbody = require("glsl-colormap/blackbody")
varying vec2 vUv;
varying float vCi;

void main() {
  gl_FragColor = blackbody(vCi / 10000.);
}
