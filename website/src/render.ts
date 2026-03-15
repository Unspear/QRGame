import Chars from './chars.png';
import CharsText from './chars.txt'
import { CHAR_WIDTH, FRAME_TIME, PALETTE_FRACTIONS } from './constants';
import { FRAME_TIME_MS } from './constants'


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
        gl.vertexAttribPointer(this.#iBackColorLoc, 4, GL.FLOAT, true, this.#instanceStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#iFrontColorLoc, 4, GL.FLOAT, true, this.#instanceStride * BPE, 4 * BPE);
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
import { Point } from './util';

type LinePattern = {
    offset: number;
    interval: number;
    dashLength: number;
}

class LinePipeline {
    #program: WebGLProgram;
    #vColorLoc: number;
    #vPositionLoc: number;
    #vOffsetLoc: number;
    #uViewLoc: WebGLUniformLocation;
    #uLinePatternLoc: WebGLUniformLocation;
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
        this.#vOffsetLoc = gl.getAttribLocation(this.#program, 'vOffset');
        this.#uViewLoc = gl.getUniformLocation(this.#program, 'uView')!;
        this.#uLinePatternLoc = gl.getUniformLocation(this.#program, 'uLinePattern')!;
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
        gl.enableVertexAttribArray(this.#vOffsetLoc);
        gl.vertexAttribPointer(this.#vColorLoc, 4, GL.FLOAT, true, this.#vertexStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, this.#vertexStride * BPE, 4 * BPE);
        gl.vertexAttribPointer(this.#vOffsetLoc, 1, GL.FLOAT, false, this.#vertexStride * BPE, 6 * BPE);
    }
    addData(x: number, y: number, r: number, g: number, b: number, a: number, offset: number) {
        let start = this.#numVertices * this.#vertexStride;
        this.#vertexData.set([r, g, b, a, x, y, offset, 0], start);
        this.#numVertices++;
    }
    draw(gl: WebGL2RenderingContext, view: ViewData, pattern: LinePattern) {
        if (this.#numVertices === 0) { 
            return;
        }
        // Shaders
        gl.useProgram(this.#program);
        gl.uniform4fv(this.#uViewLoc, view);
        gl.uniform3fv(this.#uLinePatternLoc, [pattern.offset, pattern.interval, pattern.dashLength]);
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
    #previousTimestamp: DOMHighResTimeStamp | undefined;
    #frameCallback: (() => void) | undefined;
    #spritePipeline: SpritePipeline;
    #linePipeline: LinePipeline;
    paused: boolean;
    renderTime: number;
    viewOffset: Point;
    constructor(canvas: HTMLCanvasElement) {
        this.#gl = canvas.getContext("webgl2", { premultipliedAlpha: false })!;//{ antialias: false }
        this.#gl.enable(GL.BLEND);
        this.#gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.clearColor(0, 0, 0, 1);
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.#spritePipeline = new SpritePipeline(this.#gl);
        this.#linePipeline = new LinePipeline(this.#gl);
        this.paused = false;
        this.renderTime = 0;
        this.viewOffset = {x: 0, y: 0};
    }
    startRenderLoop(frameCallback: () => void) {
        this.#frameCallback = frameCallback;
        requestAnimationFrame((t) => this.#renderFrame(t));
    }
    #renderFrame(timestamp: DOMHighResTimeStamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        if ((this.#gl.canvas as HTMLCanvasElement).checkVisibility() && !this.paused) {
            const elapsed = timestamp - this.#previousTimestamp;
            if (elapsed >= FRAME_TIME_MS) {
                this.#frameCallback!();
                this.renderTime += FRAME_TIME;
                if (elapsed > FRAME_TIME_MS * 5) {
                    console.log("Elapsed time is large, skipping frames")
                    this.#previousTimestamp = timestamp;
                } else {
                    this.#previousTimestamp += FRAME_TIME_MS;
                }
            }
        } else {
            this.#previousTimestamp = timestamp;
        }
        requestAnimationFrame((t) => this.#renderFrame(t));
    }
    beginFrame() {
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    }
    endFrame() {
        const viewData: ViewData = [this.viewOffset.x, this.viewOffset.y, this.#gl.canvas.width, this.#gl.canvas.height];
        this.#spritePipeline.draw(this.#gl, viewData);
        this.#linePipeline.draw(this.#gl, viewData, { offset: this.renderTime * 4.0, interval: 4, dashLength: 2});
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
    drawBox(x0: number, y0: number, x1: number, y1: number, margin: number) {
        x0 -= margin;
        y0 -= margin;
        x1 += margin;
        y1 += margin;

        let totalOffset = 0;

        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(x0 - x1);
        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1, totalOffset);

        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(y0 - y1);
        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1, totalOffset);

        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(x0 - x1);
        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1, totalOffset);

        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(y0 - y1);
        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1, totalOffset);
    }
    drawGrid(x0: number, y0: number, x1: number, y1: number, xTiles: number, yTiles: number) {
        x0 += 0.5;
        y0 += 0.5;
        x1 += 0.5;
        y1 += 0.5;
        const yIncrement = (y1 - y0) / yTiles
        for (let i = 1; i < yTiles; i++) {
            const yOffset = y0 + yIncrement * i;
            this.#linePipeline.addData(x0, yOffset, 0, 0.5, 1, 0.5, 0);
            this.#linePipeline.addData(x1, yOffset, 0, 0.5, 1, 0.5, x1-x0);
        }
        const xIncrement = (x1 - x0) / xTiles
        for (let i = 1; i < xTiles; i++) {
            const xOffset = x0 + xIncrement * i;
            this.#linePipeline.addData(xOffset, y0, 0, 0.5, 1, 0.5, 0);
            this.#linePipeline.addData(xOffset, y1, 0, 0.5, 1, 0.5, y1-y0);
        }
    }
}