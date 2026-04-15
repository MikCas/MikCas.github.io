#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2  uRes;
uniform float uCell;
uniform float uSub;
uniform float uMaxLW;
uniform float uMinW;
uniform float uMajW;
uniform float uMinO;
uniform float uFade;
uniform vec3  uBg;
uniform vec3  uMinC;
uniform vec3  uMajC;
uniform vec2  uOff;

float pristineGrid(vec2 uv, vec2 lw) {
  vec2 ddx_uv = dFdx(uv);
  vec2 ddy_uv = dFdy(uv);
  vec2 uvDeriv = vec2(length(vec2(ddx_uv.x, ddy_uv.x)), length(vec2(ddx_uv.y, ddy_uv.y)));
  vec2 drawWidth = max(lw, uvDeriv);
  vec2 lineAA = uvDeriv * 1.5;
  vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);
  vec2 grid2 = 1.0 - smoothstep(drawWidth - lineAA, drawWidth + lineAA, gridUV);
  grid2 *= clamp(lw / drawWidth, 0.0, 1.0);
  grid2 = mix(grid2, lw, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));
  return mix(grid2.x, 1.0, grid2.y);
}

void main() {
  vec2 px = gl_FragCoord.xy - uRes * 0.5 + uOff;
  vec2 uv = px / uCell;
  float mnW = uMinW * uMaxLW;
  float mjW = uMajW * uMaxLW;

  float minorMask = pristineGrid(uv * uSub, vec2(mnW));
  float majorMask = pristineGrid(uv, vec2(mjW));

  vec3 c = uBg;
  c = mix(c, uMinC, minorMask * uMinO);
  c = mix(c, uMajC, majorMask);

  float dist = length(px);
  float fade = 1.0 - smoothstep(0.0, uFade, dist);
  c = mix(uBg, c, fade);

  gl_FragColor = vec4(c, 1.0);
}