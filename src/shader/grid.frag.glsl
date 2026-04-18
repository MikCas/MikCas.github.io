#extension GL_OES_standard_derivatives : enable
precision highp float;

#define PI 3.14159265358979

uniform vec2  uRes;
uniform float uCell;
uniform float uSub;
uniform float uMaxLW;
uniform float uMinW;
uniform float uMajW;
uniform float uFade;
uniform vec3  uBg;
uniform vec3  uMinC;
uniform vec3  uMajC;
uniform vec2  uOff;
uniform float uMode;
uniform float uParamA;
uniform float uParamB;

vec2 rotate(vec2 v, float a) {
  float s = sin(a), c = cos(a);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

float grid(vec2 uv, vec2 lw) {
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
  float mnW = uMinW * uMaxLW;
  float mjW = uMajW * uMaxLW;
  vec2 p = gl_FragCoord.xy - uRes * 0.5 + uOff; // centred coordinate

  float minor = 0.0;
  float major = 0.0;

  if (uMode < 0.5) {
    // square, standard orthogonal grid
    vec2 uv = gl_FragCoord.xy / uCell;
    minor = grid(uv * uSub, vec2(mnW));
    major = grid(uv,        vec2(mjW));

  } else if (uMode < 1.5) {
    // rotated, grid rotated around screen centre
    float angle = (uParamA / 100.0) * PI;
    vec2 uv = rotate(p, angle) / uCell;
    minor = grid(uv * uSub, vec2(mnW));
    major = grid(uv,        vec2(mjW));

  } else if (uMode < 2.5) {
    // moire, two grids at independent angles
    float a1 = (uParamA / 100.0) * PI * 0.5;
    float a2 = (uParamB / 100.0) * PI * 0.5;
    vec2 uv1 = rotate(p, a1) / uCell;
    vec2 uv2 = rotate(p, a2) / uCell;
    minor = max(grid(uv1 * uSub, vec2(mnW)), grid(uv2 * uSub, vec2(mnW)));
    major = max(grid(uv1,        vec2(mjW)), grid(uv2,        vec2(mjW)));

  } else if (uMode < 3.5) {
    // brick, offset x shifts every other row, offset y shifts every other column
    vec2 uv = gl_FragCoord.xy / uCell;
    float fy = floor(uv.y);
    float fx = floor(uv.x);
    uv.x += mod(fy, 2.0) * (uParamA / 100.0) * 0.5;
    uv.y += mod(fx, 2.0) * (uParamB / 100.0) * 0.5;
    minor = grid(uv * uSub, vec2(mnW));
    major = grid(uv,        vec2(mjW));

  } else if (uMode < 4.5) {
    // polar, concentric rings + radial spokes
    float r      = length(p) / uCell * (1.0 + (uParamA / 100.0) * 4.0);
    float spokes = floor((uParamB / 100.0) * 23.0) + 1.0;
    float theta  = atan(p.y, p.x) / (2.0 * PI) * spokes;
    vec2 uv = vec2(r, theta);
    minor = grid(uv * uSub, vec2(mnW));
    major = grid(uv,        vec2(mjW));

  } else if (uMode < 5.5) {
    // dots, filled circles at each grid cell centre
    vec2 uv   = gl_FragCoord.xy / uCell;
    vec2 f    = fract(uv) - 0.5;
    float radius = 0.05 + (uParamA / 100.0) * 0.40;
    major = 1.0 - smoothstep(radius - 0.02, radius + 0.02, length(f));

  } else {
    // waves, sine wave distortion applied to UV
    float amp  = (uParamA / 100.0) * 80.0;
    float freq = 0.01 + (uParamB / 100.0) * 0.14;
    float dx = sin(gl_FragCoord.y * freq) * amp;
    float dy = sin(gl_FragCoord.x * freq) * amp;
    vec2 uv = (gl_FragCoord.xy + vec2(dx, dy)) / uCell;
    minor = grid(uv * uSub, vec2(mnW));
    major = grid(uv,        vec2(mjW));
  }

  // Colour
  vec3 c = uBg;
  c = mix(c, uMinC, minor);
  c = mix(c, uMajC, major);

  float dist = length(p);
  c = mix(uBg, c, 1.0 - smoothstep(0.0, uFade, dist));

  gl_FragColor = vec4(c, 1.0);
}
