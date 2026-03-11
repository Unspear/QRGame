import Chars from './chars.png';
import CharsText from './chars.txt'
import { CHAR_WIDTH, PALETTE, PALETTE_FRACTIONS } from './constants';

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

type ViewData = [number, number, number, number];
const GL = WebGL2RenderingContext;

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const vertexShader = gl.createShader(GL.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, GL.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        console.log(`Failed to compile vertex shader: ${errorMessage}`);
        return null;
    }
    const fragmentShader = gl.createShader(GL.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, GL.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        console.log(`Failed to compile fragment shader: ${errorMessage}`);
        return null;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, GL.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(program);
        console.log(`Failed to link GPU program: ${errorMessage}`);
        return null;
    }
    return program;
}

function createTexture(gl: WebGL2RenderingContext, image: HTMLImageElement) {
    const texture = gl.createTexture();
    gl.bindTexture(GL.TEXTURE_2D, texture);
    gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    gl.bindTexture(GL.TEXTURE_2D, null);
    return texture;
}
import spriteVertexSource from "./shaders/sprite.vert"
import spriteFragmentSource from "./shaders/sprite.frag";

class SpritePipeline {
    #program: WebGLProgram;
    #vPositionLoc: number;
    #vTexCoordLoc: number;
    #iOffsetLoc: number;
    #iBackColorLoc: number;
    #iFrontColorLoc: number;
    #iTexIndexLoc: number;
    #iHalfWidth: number;
    #uView: WebGLUniformLocation;
    #vao: WebGLVertexArrayObject;
    #numInstances: number;
    #instanceStride: number;
    #numVertices: number;
    #instanceBuffer: WebGLBuffer;
    #instanceData: Float32Array;
    #texture: WebGLTexture;
    constructor(gl: WebGL2RenderingContext) {
        this.#program = createProgram(gl, spriteVertexSource, spriteFragmentSource)!;
        // Shader Locations
        this.#vPositionLoc = gl.getAttribLocation(this.#program, 'vPosition');
        this.#vTexCoordLoc = gl.getAttribLocation(this.#program, 'vTexCoord');
        this.#iOffsetLoc = gl.getAttribLocation(this.#program, 'iOffset');
        this.#iBackColorLoc = gl.getAttribLocation(this.#program, 'iBackColor');
        this.#iFrontColorLoc = gl.getAttribLocation(this.#program, 'iFrontColor');
        this.#iTexIndexLoc = gl.getAttribLocation(this.#program, 'iTexIndex');
        this.#iHalfWidth = gl.getAttribLocation(this.#program, 'iHalfWidth');
        this.#uView = gl.getUniformLocation(this.#program, 'uView')!;
        // Make VAO
        this.#vao = gl.createVertexArray();
        gl.bindVertexArray(this.#vao);
        this.#numVertices = 6;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 16,
            0, 0,
            16, 0,
            0, 16,
            16, 0,
            16, 16,
        ]), GL.STATIC_DRAW);
        gl.enableVertexAttribArray(this.#vPositionLoc);
        gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, 0, 0);
        // Position Buffer
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 1,
            0, 0,
            1, 0,
            0, 1,
            1, 0,
            1, 1,
        ]), GL.STATIC_DRAW);
        gl.enableVertexAttribArray(this.#vTexCoordLoc);
        gl.vertexAttribPointer(this.#vTexCoordLoc, 2, GL.FLOAT, false, 0, 0);
        // Sprite Buffer
        //vec4 iBackColor; 16 bytes
        //vec4 iFrontColor; 16 bytes
        //vec2 iOffset; 8 bytes
        //float iTexIndex; 4 byte
        //float pad; 4 bytes
        this.#instanceStride = 12;
        this.#numInstances = 0;
        this.#instanceBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        this.#instanceData = new Float32Array(this.#instanceStride * 16384);
        gl.bufferData(GL.ARRAY_BUFFER, this.#instanceData, GL.DYNAMIC_DRAW);
        const BPE = Float32Array.BYTES_PER_ELEMENT;// Bytes per element
        gl.enableVertexAttribArray(this.#iBackColorLoc);
        gl.enableVertexAttribArray(this.#iFrontColorLoc);
        gl.enableVertexAttribArray(this.#iOffsetLoc);
        gl.enableVertexAttribArray(this.#iTexIndexLoc);
        gl.enableVertexAttribArray(this.#iHalfWidth);
        gl.vertexAttribPointer(this.#iBackColorLoc, 4, GL.FLOAT, false, this.#instanceStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#iFrontColorLoc, 4, GL.FLOAT, false, this.#instanceStride * BPE, 4 * BPE);
        gl.vertexAttribPointer(this.#iOffsetLoc, 2, GL.FLOAT, false, this.#instanceStride * BPE, 8 * BPE);
        gl.vertexAttribPointer(this.#iTexIndexLoc, 1, GL.FLOAT, false, this.#instanceStride * BPE, 10 * BPE);
        gl.vertexAttribPointer(this.#iHalfWidth, 1, GL.FLOAT, false, this.#instanceStride * BPE, 11 * BPE);
        gl.vertexAttribDivisor(this.#iBackColorLoc, 1);
        gl.vertexAttribDivisor(this.#iFrontColorLoc, 1);
        gl.vertexAttribDivisor(this.#iOffsetLoc, 1);
        gl.vertexAttribDivisor(this.#iTexIndexLoc, 1);
        gl.vertexAttribDivisor(this.#iHalfWidth, 1);
        // Draw
        let that = this;
        this.#texture = createTexture(gl, spriteSheet);
        spriteSheet.decode().then(function() {
            that.#texture = createTexture(gl, spriteSheet);
        });
    }
    addData(x: number, y: number, color: number, codepoint: number, compact: boolean = false) {
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
    draw(gl: WebGL2RenderingContext, view: ViewData) {
        if (this.#numInstances === 0) {
            return;
        }
        // Shaders
        gl.useProgram(this.#program);
        gl.uniform4fv(this.#uView, view);
        gl.bindTexture(GL.TEXTURE_2D, this.#texture);
        // Attributes
        gl.bindVertexArray(this.#vao);
        // Instance Data
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.#instanceData, 0, this.#numInstances * this.#instanceStride * Float32Array.BYTES_PER_ELEMENT);
        // Draw
        gl.drawArraysInstanced(GL.TRIANGLES, 0, this.#numVertices, this.#numInstances);
        this.#numInstances = 0;
    }
}

import lineVertexSource from "./shaders/line.vert"
import lineFragmentSource from "./shaders/line.frag";

class LinePipeline {
    #program: WebGLProgram;
    #vColorLoc: number;
    #vPositionLoc: number;
    #uView: WebGLUniformLocation;
    #vao: WebGLVertexArrayObject;
    #vertexStride: number;
    #numVertices: number;
    #vertexBuffer: WebGLBuffer;
    #vertexData: Float32Array;
    constructor(gl: WebGL2RenderingContext) {
        this.#program = createProgram(gl, lineVertexSource, lineFragmentSource)!;
        // Shader Locations
        this.#vPositionLoc = gl.getAttribLocation(this.#program, 'vPosition');
        this.#vColorLoc = gl.getAttribLocation(this.#program, 'vColor');
        this.#uView = gl.getUniformLocation(this.#program, 'uView')!;
        // Make VAO
        this.#vao = gl.createVertexArray();
        gl.bindVertexArray(this.#vao);
        this.#vertexStride = 8;
        this.#numVertices = 0;
        this.#vertexBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#vertexBuffer);
        this.#vertexData = new Float32Array(this.#vertexStride * 16384);
        gl.bufferData(GL.ARRAY_BUFFER, this.#vertexData, GL.DYNAMIC_DRAW);
        const BPE = Float32Array.BYTES_PER_ELEMENT;// Bytes per element
        gl.enableVertexAttribArray(this.#vColorLoc);
        gl.enableVertexAttribArray(this.#vPositionLoc);
        gl.vertexAttribPointer(this.#vColorLoc, 4, GL.FLOAT, false, this.#vertexStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, this.#vertexStride * BPE, 4 * BPE);
    }
    addData(x: number, y: number, r: number, g: number, b: number, a: number) {
        let start = this.#numVertices * this.#vertexStride;
        this.#vertexData.set([r, g, b, a, x, y, 0, 0], start);
        this.#numVertices++;
    }
    draw(gl: WebGL2RenderingContext, view: ViewData) {
        if (this.#numVertices === 0) { 
            return;
        }
        // Shaders
        gl.useProgram(this.#program);
        gl.uniform4fv(this.#uView, view);
        // Attributes
        gl.bindVertexArray(this.#vao);
        // Instance Data
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#vertexBuffer);
        gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.#vertexData, 0, this.#numVertices * this.#vertexStride * Float32Array.BYTES_PER_ELEMENT);
        // Draw
        gl.drawArrays(GL.LINES, 0, this.#numVertices);
        this.#numVertices = 0;
    }
}

export class Renderer {
    #gl: WebGL2RenderingContext;
    #spritePipeline: SpritePipeline;
    #linePipeline: LinePipeline;
    constructor(canvas: HTMLCanvasElement) {
        this.#gl = canvas.getContext("webgl2")!;//{ antialias: false }
        this.#spritePipeline = new SpritePipeline(this.#gl);
        this.#linePipeline = new LinePipeline(this.#gl);
    }
    beginFrame() {
        this.#gl.clearColor(0, 0, 0, 1);
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
    }
    endFrame() {
        const viewData: ViewData = [0, 0, this.#gl.canvas.width, this.#gl.canvas.height];
        this.#spritePipeline.draw(this.#gl, viewData);
        this.#linePipeline.draw(this.#gl, viewData);
        this.#gl.flush();
    }
    drawCharacters(codePoints: number[], colors: number[], posX: number, posY: number, pivotX: number, pivotY: number, wrap: number, compact: boolean) {
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
            this.#spritePipeline.addData(roundedX + offset.x, roundedY + offset.y, colors[i], codePoints[i], compact);
        }
    }
    drawBox(x0: number, y0: number, x1: number, y1: number) {
        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1);
        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1);

        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1);
        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1);

        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1);
        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1);

        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1);
        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1);
    }
}