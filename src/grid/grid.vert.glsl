// Ported from TouchDesigner vertex shader
// TD functions replaced with Three.js built-ins

varying vec3 vWorldSpacePos;
varying vec3 vCamPos;

void main() {
  // Three.js provides: modelMatrix, viewMatrix, projectionMatrix, cameraPosition, position
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * viewMatrix * worldPos;

  vCamPos = cameraPosition;
  vWorldSpacePos = worldPos.xyz;
}
