import * as THREE from 'three';
import vertexShader from './grid.vert.glsl';
import fragmentShader from './grid.frag.glsl';

export function createGridScene(canvas) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene
  const scene = new THREE.Scene();

  // Camera — perspective, looking down at the grid
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);

  // Shader uniforms
  const uniforms = {
    uPlaneMode:    { value: 2 },       // ZX (top-down floor)
    uCellSize:     { value: 1.0 },
    uSubdivisions: { value: 4.0 },
    uMaxLineWidth: { value: 0.05 },
    uMinWidth:     { value: 0.02 },
    uMajWidth:     { value: 0.04 },
    uAxisWidth:    { value: 0.06 },
    uMinColor:     { value: new THREE.Vector4(0.2, 0.2, 0.2, 1.0) },
    uMajColor:     { value: new THREE.Vector4(0.4, 0.4, 0.4, 1.0) },
    uBgColor:      { value: new THREE.Vector4(0.0, 0.0, 0.0, 1.0) },
    uMinOpacity:   { value: 0.5 },
    uFadeDistance:  { value: 50.0 },
    uColorX:       { value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0) },
    uColorY:       { value: new THREE.Vector4(0.0, 1.0, 0.0, 1.0) },
    uColorZ:       { value: new THREE.Vector4(0.0, 0.0, 1.0, 1.0) },
  };

  // Grid mesh — large flat plane with custom shader
  const geometry = new THREE.PlaneGeometry(200, 200);
  geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const gridMesh = new THREE.Mesh(geometry, material);
  scene.add(gridMesh);

  // Resize handler
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // Return handles for mouse controls (Task 5)
  return { renderer, scene, camera, uniforms };
}
