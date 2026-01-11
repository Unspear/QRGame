import { Game } from './game.js'
import charRenderer from './render.js'

function getPointerPos(canvas, event) {
    const canvasScaleX = canvas.offsetWidth / canvas.width;
    const canvasScaleY = canvas.offsetHeight / canvas.height;
    const x = Math.floor(event.offsetX / canvasScaleX)
    const y = Math.floor(event.offsetY / canvasScaleY)
    return { x: x, y: y };
}

export class Editor {
    constructor(editorCanvas) {
        this.editorCanvas = editorCanvas;
        this.ctx = editorCanvas.getContext('2d');
        this.placingTiles = false;
        window.addEventListener('pointerdown', (event) => {
            this.placingTiles = true;
            this.draw();
        });
        window.addEventListener('pointerup', (event) => {
            this.placingTiles = false;
            this.draw();
        });
        editorCanvas.addEventListener('pointermove', (event) => {
            if (this.placingTiles) {
                let epos = getPointerPos(editorCanvas, event);
                let x = Math.floor(epos.x / 16);
                let y = Math.floor(epos.y / 16);
                this.tiles[y * 12 + x] = '#';
                this.draw();
            }
        });
        this.tiles = Array(16*12).fill(' ');
        this.draw();
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        charRenderer.draw(this.ctx, this.tiles.join(''), 0, 0, '#ffffff', 12, false);
    }
}