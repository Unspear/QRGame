import Chars from './chars.png';
import CharsText from './chars.txt'
import { CHAR_WIDTH, PALETTE } from './constants';
import vertexShaderSourceCode from "./shaders/simple.vert"
import fragmentShaderSourceCode from "./shaders/simple.frag";

type SpriteSheetEntry = {
  index: number;
  isFullWidth: boolean;
};

let spriteSheet: HTMLImageElement = new Image();
spriteSheet.src = Chars;
let spriteSheetData: Record<number, SpriteSheetEntry> = {};
let lines = CharsText.split('\n');
for (let i = 0; i < lines.length; i++)
{
    let l = lines[i].split(',');
    spriteSheetData[parseInt(l[0])] = {
        index: i,
        isFullWidth: parseInt(l[1]) > 0
    }
}
const GL = WebGL2RenderingContext;
export class Renderer {
    #gl: WebGL2RenderingContext;
    // Shader Locations
    #vPositionLoc: number;
    #vTexCoordLoc: number;
    #iOffsetLoc: number;
    #iBackColorLoc: number;
    #iFrontColorLoc: number;
    #iTexIndexLoc: number;
    // VAO
    #vao: WebGLVertexArrayObject;
    constructor(canvas: HTMLCanvasElement) {
        this.#gl = canvas.getContext("webgl2", { antialias: false })!;
        // Shader Program
        const vertexShader = this.#gl.createShader(GL.VERTEX_SHADER)!;
        this.#gl.shaderSource(vertexShader, vertexShaderSourceCode);
        this.#gl.compileShader(vertexShader);
        if (!this.#gl.getShaderParameter(vertexShader, GL.COMPILE_STATUS)) {
            const errorMessage = this.#gl.getShaderInfoLog(vertexShader);
            console.log(`Failed to compile vertex shader: ${errorMessage}`);
        }
        const fragmentShader = this.#gl.createShader(GL.FRAGMENT_SHADER)!;
        this.#gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
        this.#gl.compileShader(fragmentShader);
        if (!this.#gl.getShaderParameter(fragmentShader, GL.COMPILE_STATUS)) {
            const errorMessage = this.#gl.getShaderInfoLog(fragmentShader);
            console.log(`Failed to compile fragment shader: ${errorMessage}`);
        }
        const program = this.#gl.createProgram();
        this.#gl.attachShader(program, vertexShader);
        this.#gl.attachShader(program, fragmentShader);
        this.#gl.linkProgram(program);
        if (!this.#gl.getProgramParameter(program, GL.LINK_STATUS)) {
            const errorMessage = this.#gl.getProgramInfoLog(program);
            console.log(`Failed to link GPU program: ${errorMessage}`);
        }
        // Shader Locations
        this.#vPositionLoc = this.#gl.getAttribLocation(program, 'vPosition');
        this.#vTexCoordLoc = this.#gl.getAttribLocation(program, 'vTexCoord');
        this.#iOffsetLoc = this.#gl.getAttribLocation(program, 'iOffset');
        this.#iBackColorLoc = this.#gl.getAttribLocation(program, 'iBackColor');
        this.#iFrontColorLoc = this.#gl.getAttribLocation(program, 'iFrontColor');
        this.#iTexIndexLoc = this.#gl.getAttribLocation(program, 'iTexIndex');
        // Make VAO
        this.#vao = this.#gl.createVertexArray();
        this.#gl.bindVertexArray(this.#vao);
        const numVertices = 6;
        // Position Buffer
        const positionBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        this.#gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            -0.5,  0.5,
            -0.5, -0.5,
            0.5, -0.5,
            -0.5,  0.5,
            0.5, -0.5,
            0.5,  0.5,
            ]), GL.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#vPositionLoc);
        this.#gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, 0, 0);
        // Position Buffer
        const texCoordBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, texCoordBuffer);
        this.#gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 1,
            0, 0,
            1, 0,
            0, 1,
            1, 0,
            1, 1,
        ]), GL.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#vTexCoordLoc);
        this.#gl.vertexAttribPointer(this.#vTexCoordLoc, 2, GL.FLOAT, false, 0, 0);
        // Sprite Buffer
        //vec4 iBackColor; 16 bytes
        //vec4 iFrontColor; 16 bytes
        //vec2 iOffset; 8 bytes
        //float iTexIndex; 4 byte
        //float pad; 4 bytes
        const instanceBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, instanceBuffer);
        this.#gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 0, 0, 0,
            1, 1, 1, 1,
            0.13, 0.13,
            0, 
            0
        ]), GL.DYNAMIC_DRAW);
        const numInstances = 1;
        const instanceStride = 12;
        this.#gl.enableVertexAttribArray(this.#iBackColorLoc);
        this.#gl.vertexAttribPointer(this.#iBackColorLoc, 4, GL.FLOAT, false, instanceStride * 4, 0 * 4);
        this.#gl.vertexAttribDivisor(this.#iBackColorLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iFrontColorLoc);
        this.#gl.vertexAttribPointer(this.#iFrontColorLoc, 4, GL.FLOAT, false, instanceStride * 4, 4 * 4);
        this.#gl.vertexAttribDivisor(this.#iFrontColorLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iOffsetLoc);
        this.#gl.vertexAttribPointer(this.#iOffsetLoc, 2, GL.FLOAT, false, instanceStride * 4, 8 * 4);
        this.#gl.vertexAttribDivisor(this.#iOffsetLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iTexIndexLoc);
        this.#gl.vertexAttribPointer(this.#iTexIndexLoc, 1, GL.FLOAT, false, instanceStride * 4, 10 * 4);
        this.#gl.vertexAttribDivisor(this.#iTexIndexLoc, 1);
        // Draw
        this.#gl.clearColor(1, 0, 1, 1);
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.useProgram(program);
        this.#gl.bindVertexArray(this.#vao);
        this.#gl.drawArraysInstanced(GL.TRIANGLES, 0, numVertices, numInstances);
    }
}