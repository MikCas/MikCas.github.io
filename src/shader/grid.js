import vsSrc from './grid.vert.glsl?raw';
import fsSrc from './grid.frag.glsl?raw';

export function initGrid(canvas, getParams) {

    const gl = canvas.getContext('webgl', { alpha: false });
    if (!gl) throw new Error('WebGL not supported');
    gl.getExtension('OES_standard_derivatives');

    function compileKernel(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Compile error: ' + gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileKernel(vsSrc, gl.VERTEX_SHADER));
    gl.attachShader(prog, compileKernel(fsSrc, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    const uniformNames = [
        'uRes','uCell','uSub','uMaxLW','uMinW','uMajW',
        'uFade','uBg','uMinC','uMajC','uOff',
        'uMode','uParamA','uParamB'
    ];
    uniformNames.forEach(name => {
        u[name] = gl.getUniformLocation(prog, name);
    });

    function render() { 
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        const p = getParams();
        gl.uniform2f (u.uRes,   canvas.width, canvas.height);
        gl.uniform1f (u.uCell,  p.cell);
        gl.uniform1f (u.uSub,   p.sub);
        gl.uniform1f (u.uMaxLW, p.maxLW);
        gl.uniform1f (u.uMinW,  p.minW);
        gl.uniform1f (u.uMajW,  p.majW);
        gl.uniform1f (u.uFade,  p.fade);
        gl.uniform3fv(u.uBg,    p.bg);
        gl.uniform3fv(u.uMinC,  p.minC);
        gl.uniform3fv(u.uMajC,  p.majC);
        gl.uniform2f (u.uOff,   p.off[0], p.off[1]);
        gl.uniform1f (u.uMode,   p.mode);
        gl.uniform1f (u.uParamA, p.paramA);
        gl.uniform1f (u.uParamB, p.paramB);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(render);
    } 
    render();
}