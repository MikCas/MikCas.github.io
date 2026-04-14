import './style.css';
import vsSrc from './grid.vert.glsl?raw';
import fsSrc from './grid.frag.glsl?raw';

// Context allocation
const canvas = document.getElementById('grid');
const gl = canvas.getContext('webgl', { alpha: false });
if (!gl) throw new Error('WebGL not supported');

// Hardware extensions
gl.getExtension('OES_standard_derivatives');

// Shader compilation
function compileKernel(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Compile error: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Linker
const prog = gl.createProgram();
gl.attachShader(prog, compileKernel(vsSrc, gl.VERTEX_SHADER));
gl.attachShader(prog, compileKernel(fsSrc, gl.FRAGMENT_SHADER));
gl.linkProgram(prog);
gl.useProgram(prog);

// VRAM allocation
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);

// Vertex mapping
const aPos = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

// Uniform mapping
const u = {};
const uniformNames = [
  'uRes','uCell','uSub','uMaxLW','uMinW','uMajW',
  'uAxW','uMinO','uFade','uBg','uMinC','uMajC','uAXC','uAYC','uOff'
];
uniformNames.forEach(name => {
  u[name] = gl.getUniformLocation(prog, name);
});

// Type conversion
const hex = (h) => [
  parseInt(h.slice(1,3), 16) / 255,
  parseInt(h.slice(3,5), 16) / 255,
  parseInt(h.slice(5,7), 16) / 255
];

// Render loop
function render() {
  // Resolution sync
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // State upload
  gl.uniform2f(u.uRes, canvas.width, canvas.height);
  gl.uniform1f(u.uCell, 80);
  gl.uniform1f(u.uSub, 4);
  gl.uniform1f(u.uMaxLW, 0.04);
  gl.uniform1f(u.uMinW, 0.3);
  gl.uniform1f(u.uMajW, 0.5);
  gl.uniform1f(u.uAxW, 0.6);
  gl.uniform1f(u.uMinO, 0.4);
  gl.uniform1f(u.uFade, 9999.0);
  gl.uniform3fv(u.uBg, hex('#c8c8c8'));
  gl.uniform3fv(u.uMinC, hex('#999999'));
  gl.uniform3fv(u.uMajC, hex('#666666'));
  gl.uniform3fv(u.uAXC, hex('#cc4444'));
  gl.uniform3fv(u.uAYC, hex('#44aa44'));
  gl.uniform2f(u.uOff, 0, 0);

  // Execution
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  // Loop scheduling
  requestAnimationFrame(render);
}

render();