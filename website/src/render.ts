import Chars from './chars.png';
import CharsText from './chars.txt'
import { CHAR_WIDTH, PALETTE, PALETTE_FRACTIONS } from './constants';
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
    #iHalfWidth: number;
    #uView: WebGLUniformLocation;
    // VAO
    #vao: WebGLVertexArrayObject;
    // Stuff
    #numInstances: number;
    #instanceStride: number;
    #numVertices: number;
    #instanceBuffer: WebGLBuffer;
    #program: WebGLProgram;
    // Buffer
    #instanceData: Float32Array;
    constructor(canvas: HTMLCanvasElement) {
        this.#gl = canvas.getContext("webgl2")!;//{ antialias: false }
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
        this.#program = this.#gl.createProgram();
        this.#gl.attachShader(this.#program, vertexShader);
        this.#gl.attachShader(this.#program, fragmentShader);
        this.#gl.linkProgram(this.#program);
        if (!this.#gl.getProgramParameter(this.#program, GL.LINK_STATUS)) {
            const errorMessage = this.#gl.getProgramInfoLog(this.#program);
            console.log(`Failed to link GPU program: ${errorMessage}`);
        }
        // Shader Locations
        this.#vPositionLoc = this.#gl.getAttribLocation(this.#program, 'vPosition');
        this.#vTexCoordLoc = this.#gl.getAttribLocation(this.#program, 'vTexCoord');
        this.#iOffsetLoc = this.#gl.getAttribLocation(this.#program, 'iOffset');
        this.#iBackColorLoc = this.#gl.getAttribLocation(this.#program, 'iBackColor');
        this.#iFrontColorLoc = this.#gl.getAttribLocation(this.#program, 'iFrontColor');
        this.#iTexIndexLoc = this.#gl.getAttribLocation(this.#program, 'iTexIndex');
        this.#iHalfWidth = this.#gl.getAttribLocation(this.#program, 'iHalfWidth');
        this.#uView = this.#gl.getUniformLocation(this.#program, 'uView')!;
        // Make VAO
        this.#vao = this.#gl.createVertexArray();
        this.#gl.bindVertexArray(this.#vao);
        this.#numVertices = 6;
        // Position Buffer
        const positionBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        this.#gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 16,
            0, 0,
            16, 0,
            0, 16,
            16, 0,
            16, 16,
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
        this.#instanceStride = 12;
        this.#numInstances = 0;
        this.#instanceBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        this.#instanceData = new Float32Array(this.#instanceStride * 16384);
        this.#gl.bufferData(GL.ARRAY_BUFFER, this.#instanceData, GL.DYNAMIC_DRAW);
        const BPE = Float32Array.BYTES_PER_ELEMENT;// Bytes per element
        this.#gl.enableVertexAttribArray(this.#iBackColorLoc);
        this.#gl.vertexAttribPointer(this.#iBackColorLoc, 4, GL.FLOAT, false, this.#instanceStride * BPE, 0 * BPE);
        this.#gl.vertexAttribDivisor(this.#iBackColorLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iFrontColorLoc);
        this.#gl.vertexAttribPointer(this.#iFrontColorLoc, 4, GL.FLOAT, false, this.#instanceStride * BPE, 4 * BPE);
        this.#gl.vertexAttribDivisor(this.#iFrontColorLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iOffsetLoc);
        this.#gl.vertexAttribPointer(this.#iOffsetLoc, 2, GL.FLOAT, false, this.#instanceStride * BPE, 8 * BPE);
        this.#gl.vertexAttribDivisor(this.#iOffsetLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iTexIndexLoc);
        this.#gl.vertexAttribPointer(this.#iTexIndexLoc, 1, GL.FLOAT, false, this.#instanceStride * BPE, 10 * BPE);
        this.#gl.vertexAttribDivisor(this.#iTexIndexLoc, 1);
        this.#gl.enableVertexAttribArray(this.#iHalfWidth);
        this.#gl.vertexAttribPointer(this.#iHalfWidth, 1, GL.FLOAT, false, this.#instanceStride * BPE, 11 * BPE);
        this.#gl.vertexAttribDivisor(this.#iHalfWidth, 1);
        // Draw
        let that = this;
        spriteSheet.decode().then(function() {
            const texture = that.#gl.createTexture();
            that.#gl.bindTexture(GL.TEXTURE_2D, texture);
            that.#gl.texImage2D(
                GL.TEXTURE_2D,
                0,
                GL.RGBA,
                GL.RGBA,
                GL.UNSIGNED_BYTE,
                spriteSheet,
            );
            that.#gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            that.#gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            that.#gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
            that.#gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        });
    }
    beginFrame() {
        this.#gl.clearColor(0, 0, 0, 1);
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.useProgram(this.#program);
        this.#gl.uniform4fv(this.#uView, [0, 0, this.#gl.canvas.width, this.#gl.canvas.height]);
        this.#gl.bindVertexArray(this.#vao);
    }
    endFrame() {
        this.#gl.flush();
    }
    addInstanceData(x: number, y: number, color: number, codepoint: number, compact: boolean = false) {
        let start = this.#numInstances * this.#instanceStride;
        let values = PALETTE_FRACTIONS[color % 8];
        if (color >= 8) {
            this.#instanceData.set([values[0], values[1], values[2], 1, 0, 0, 0, 0], start);
        }
        else {
            this.#instanceData.set([0, 0, 0, 0, values[0], values[1], values[2], 1], start);
        }
        start += 8
        if (!(codepoint in spriteSheetData)) {
            codepoint = 0;// NUL character
        }
        const data = spriteSheetData[codepoint];
        const isFullWidth = !compact || data.isFullWidth;
        this.#instanceData.set([x, y, data.index, isFullWidth ? 0.0 : 1.0], start);
        this.#numInstances++;
    }
    drawInstances() {
        this.#gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        this.#gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.#instanceData, 0, this.#numInstances * this.#instanceStride * Float32Array.BYTES_PER_ELEMENT);
        this.#gl.drawArraysInstanced(GL.TRIANGLES, 0, this.#numVertices, this.#numInstances);
        this.#numInstances = 0;
    }
    draw(codePoints: number[], colors: number[], posX: number, posY: number, pivotX: number, pivotY: number, wrap: number, compact: boolean) {
        console.assert(codePoints.length == colors.length)
        // Find layout
        let offsets = []
        let offsetX = 0;
        let offsetY = 0;
        for (let i = 0; i < codePoints.length; i++) {
            let codepoint = codePoints[i];
            if (!(codepoint in spriteSheetData)) {
                codepoint = 0;// NUL character
            }
            const data = spriteSheetData[codepoint];
            const isFullWidth = !compact || data.isFullWidth;
            const width = isFullWidth ? CHAR_WIDTH : CHAR_WIDTH / 2;
            if (wrap > 0 && offsetX + width > wrap * CHAR_WIDTH)
            {
                offsetX = 0;
                offsetY += CHAR_WIDTH;
            }
            offsets.push({ x: offsetX, y: offsetY });
            // Update offset
            offsetX += width
        }
        // Calc width and height
        let width = wrap > 0 ? wrap * CHAR_WIDTH : offsetX;
        let height = codePoints.length > 0 ? offsetY + CHAR_WIDTH : 0;
        // Draw
        let roundedX = Math.round(posX - width * pivotX);
        let roundedY = Math.round(posY - height * pivotY);
        for (let i = 0; i < codePoints.length; i++) {
            let offset = offsets[i];
            this.addInstanceData(roundedX + offset.x, roundedY + offset.y, colors[i], codePoints[i], compact);
        }
        this.drawInstances();
    }
}