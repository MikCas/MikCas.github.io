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

  // Mouse orbit — drag to rotate camera around the origin
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  // Spherical coordinates for camera position
  let spherical = { radius: 15, theta: Math.PI / 4, phi: Math.PI / 3 };

  function updateCameraFromSpherical() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0, 0);
  }
  updateCameraFromSpherical();

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    prevMouse = { x: e.clientX, y: e.clientY };

    spherical.theta -= dx * 0.005;
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.01, spherical.phi - dy * 0.005));
    updateCameraFromSpherical();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    spherical.radius = Math.max(5, Math.min(50, spherical.radius + e.deltaY * 0.05));
    updateCameraFromSpherical();
  }, { passive: false });

  return { renderer, scene, camera, uniforms };
}
