import './page'
import {gameToUrl} from './pack'
import library from './library'

const demoParent = document.getElementById("demos") as HTMLElement;

for(const entry of library) {
    let p = document.createElement('p');
    let a = document.createElement('a');
    a.href = gameToUrl(entry.game, "play");
    a.text = entry.title;
    p.appendChild(a);
    p.appendChild(document.createTextNode(" - " + entry.description));
    demoParent.appendChild(p);
}

// Source: https://indigocode.dev/tutorials/webgl/01-hello-triangle

let canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;
const triangleVertices = [
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
];
const triangleGeoCpuBuffer = new Float32Array(triangleVertices);

const triangleGeoBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
gl.bufferData(gl.ARRAY_BUFFER, triangleGeoCpuBuffer, gl.STATIC_DRAW);

import vertexShaderSourceCode from "./shaders/simple.vert"
const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
gl.shaderSource(vertexShader, vertexShaderSourceCode);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(vertexShader);
    console.log(`Failed to compile vertex shader: ${errorMessage}`);
}

import fragmentShaderSourceCode from "./shaders/simple.frag";

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(fragmentShader);
    console.log(`Failed to compile fragment shader: ${errorMessage}`);
}

const helloTriangleProgram = gl.createProgram();
gl.attachShader(helloTriangleProgram, vertexShader);
gl.attachShader(helloTriangleProgram, fragmentShader);
gl.linkProgram(helloTriangleProgram);
if (!gl.getProgramParameter(helloTriangleProgram, gl.LINK_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(helloTriangleProgram);
    console.log(`Failed to link GPU program: ${errorMessage}`);
}

const vertexPositionAttributeLocation = gl.getAttribLocation(helloTriangleProgram, 'vertexPosition');
if (vertexPositionAttributeLocation < 0) {
    console.log(`Failed to get attribute location for vertexPosition`);
}

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.viewport(0, 0, canvas.width, canvas.height);

gl.useProgram(helloTriangleProgram);
gl.enableVertexAttribArray(vertexPositionAttributeLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
gl.vertexAttribPointer(
    /* index: vertex attrib location */
    vertexPositionAttributeLocation,
    /* size: number of components in the attribute */
    2,
    /* type: type of data in the GPU buffer for this attribute */
    gl.FLOAT,
    /* normalized: if type=float and is writing to a vec(n) float input, should WebGL normalize the ints first? */
    false,
    /* stride: bytes between starting byte of attribute for a vertex and the same attrib for the next vertex */
    2 * Float32Array.BYTES_PER_ELEMENT,
    /* offset: bytes between the start of the buffer and the first byte of the attribute */
    0
);
gl.drawArrays(gl.TRIANGLES, 0, 3);