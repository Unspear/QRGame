import { Game } from './game.js'
import charRenderer from './render.js'

function getPointerPos(canvas, event) {
    const canvasScaleX = canvas.offsetWidth / canvas.width;
    const canvasScaleY = canvas.offsetHeight / canvas.height;
    const x = Math.floor(event.offsetX / canvasScaleX)
    const y = Math.floor(event.offsetY / canvasScaleY)
    return { x: x, y: y };
}

function pixelToTile(coords) {
    return { x: Math.floor(coords.x / 16), y: Math.floor(coords.y / 16) };
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

export class Editor {
    constructor(editorCanvas, editorCharInput) {
        this.editorCanvas = editorCanvas;
        this.editorCharInput = editorCharInput;
        this.ctx = editorCanvas.getContext('2d');
        this.placingTiles = false;
        // Place tile while pointer is held
        editorCanvas.addEventListener('pointerdown', (event) => {
            this.placingTiles = true;
            this.setTile(this.getTileFromInput(), pixelToTile(getPointerPos(editorCanvas, event)));
            this.draw();
        });
        window.addEventListener('pointerup', (event) => {
            this.placingTiles = false;
            this.draw();
        });
        editorCanvas.addEventListener('pointermove', (event) => {
            if (this.placingTiles) {
                this.setTile(this.getTileFromInput(), pixelToTile(getPointerPos(editorCanvas, event)));
                this.draw();
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        editorCanvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        editorCanvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        editorCanvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        this.dim = { w: 12, h: 16 };
        this.tiles = Array(this.dim.w * this.dim.h).fill(' ');
        this.draw();
    }
    getTileFromInput() {
        if (this.editorCharInput.value.length > 0) {
            return String.fromCodePoint(this.editorCharInput.value.codePointAt(0));
        }
        return ' ';
    }
    setTile(char, coords) {
        this.tiles[clamp(coords.y, 0, this.dim.h - 1) * this.dim.w + clamp(coords.x, 0, this.dim.w - 1)] = char;
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        charRenderer.draw(this.ctx, this.tiles, 0, 0, '#ffffff', 12, false);
    }
}