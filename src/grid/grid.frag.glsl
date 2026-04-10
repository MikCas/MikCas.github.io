// Pristine Infinite Grid Shader — ported from TouchDesigner
// Based on: https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

// GRID
uniform int   uPlaneMode;    // Grid plane: 0 = XY (Front), 1 = YZ (Right), 2 = ZX (Top)
uniform float uCellSize;     // World-space size of one major grid cell
uniform float uSubdivisions; // Minor cells per major cell

// WIDTH
uniform float uMaxLineWidth; // Maximum line width in UV space
uniform float uMinWidth;     // Minor grid line width [0–1]
uniform float uMajWidth;     // Major grid line width [0–1]
uniform float uAxisWidth;    // Axis line width [0–1]

// COLOR
uniform vec4  uMinColor;     // Minor grid line color (RGBA)
uniform vec4  uMajColor;     // Major grid line color (RGBA)
uniform vec4  uBgColor;      // Background color (RGBA)
uniform float uMinOpacity;   // Minor grid line opacity [0–1]
uniform float uFadeDistance;  // Distance at which the grid fully fades out
uniform vec4  uColorX;       // X-axis color
uniform vec4  uColorY;       // Y-axis color
uniform vec4  uColorZ;       // Z-axis color

varying vec3 vWorldSpacePos;
varying vec3 vCamPos;

// Resolution-independent AA grid (unchanged from TD)
float pristineGrid(vec2 uv, vec2 lineWidth) {
    vec2 ddx = dFdx(uv);
    vec2 ddy = dFdy(uv);
    vec2 uvDeriv = vec2(length(vec2(ddx.x, ddy.x)), length(vec2(ddx.y, ddy.y)));

    vec2 drawWidth = max(lineWidth, uvDeriv);
    vec2 lineAA = uvDeriv * 1.5;
    vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);

    vec2 grid2 = 1.0 - smoothstep(drawWidth - lineAA, drawWidth + lineAA, gridUV);
    grid2 *= clamp(lineWidth / drawWidth, 0.0, 1.0);
    grid2 = mix(grid2, lineWidth, clamp(uvDeriv * 2.0 - 1.0, 0.0, 1.0));

    return mix(grid2.x, 1.0, grid2.y);
}

// Anti-aliased axis line at uv = 0 (unchanged from TD)
vec2 axisLine(vec2 uv, float width) {
    vec2 axisW = vec2(width);
    vec2 dAxis = fwidth(uv);
    vec2 drawW = max(axisW, dAxis);
    vec2 aa = dAxis * 1.5;

    vec2 mask = 1.0 - smoothstep(drawW - aa, drawW + aa, abs(uv));
    mask *= clamp(axisW / drawW, 0.0, 1.0);
    return mask;
}

void main() {
    // UV SETUP (unchanged logic from TD)
    vec2 uv;
    vec2 fadePlane;
    vec4 axisColorU;
    vec4 axisColorV;
    vec3 wp = vWorldSpacePos;

    if (uPlaneMode == 0) {        // XY plane (Front view)
        uv = wp.xy / uCellSize;
        fadePlane = wp.xy - vCamPos.xy;
        axisColorU = uColorX;
        axisColorV = uColorY;
    } else if (uPlaneMode == 1) { // YZ plane (Right view)
        uv = wp.yz / uCellSize;
        fadePlane = wp.yz - vCamPos.yz;
        axisColorU = uColorY;
        axisColorV = uColorZ;
    } else {                      // ZX plane (Top view)
        uv = wp.xz / uCellSize;
        fadePlane = wp.xz - vCamPos.xz;
        axisColorU = uColorX;
        axisColorV = uColorZ;
    }

    // WIDTH SCALING
    float minW = uMinWidth * uMaxLineWidth;
    float majW = uMajWidth * uMaxLineWidth;
    float axisW = uAxisWidth * uMaxLineWidth;

    // GRID MASKS
    float minorMask = pristineGrid(uv * uSubdivisions, vec2(minW));
    float majorMask = pristineGrid(uv, vec2(majW));

    // AXIS MASKS
    vec2 axisMask = axisLine(uv, axisW);

    // COMPOSITE
    vec4 bg = vec4(uBgColor.rgb * uBgColor.a, uBgColor.a);
    vec4 color = mix(bg, uMinColor, minorMask * uMinOpacity);
    color = mix(color, uMajColor, majorMask);
    color = mix(color, axisColorU, axisMask.x);
    color = mix(color, axisColorV, axisMask.y);

    // DISTANCE FADE
    float dist = length(fadePlane);
    float alphaFade = 1.0 - smoothstep(0.0, uFadeDistance, dist);
    color = mix(bg, color, alphaFade);

    // Alpha discard (replaces TDAlphaTest)
    if (color.a < 0.01) discard;

    gl_FragColor = color;
}
