import { Game } from './game.js'
import charRenderer from './render.js'
import { TileMap } from './tile.js'

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
    constructor(editorCanvas, editorCharInput, editorColorInput, editorInvertedInput) {
        this.editorCanvas = editorCanvas;
        this.editorCharInput = editorCharInput;
        this.editorColorInput = editorColorInput;
        this.editorInvertedInput = editorInvertedInput;
        this.ctx = editorCanvas.getContext('2d');
        this.placingTiles = false;
        // Place tile while pointer is held
        editorCanvas.addEventListener('pointerdown', (event) => {
            this.placingTiles = true;
            this.setTileFromEvent(event);
            this.draw();
        });
        window.addEventListener('pointerup', (event) => {
            this.placingTiles = false;
            this.draw();
        });
        editorCanvas.addEventListener('pointermove', (event) => {
            if (this.placingTiles) {
                this.setTileFromEvent(event);
                this.draw();
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        editorCanvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        editorCanvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        editorCanvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        this.tileMap = new TileMap({ w: 12, h: 16 });
        this.draw();
    }
    setTileFromEvent(event) {
        // Get array of codepoints
        let codePoints = [...this.editorCharInput.value].map(c => c.codePointAt(0));
        let color = parseInt(this.editorColorInput.value);
        const inverted = this.editorInvertedInput.checked;
        if (inverted) {
            color += 8;
        }
        if (codePoints.length == 0) {
            // Erase
            codePoints = [' '.codePointAt(0)];
        }
        // Draw array to tilemap
        let coords = pixelToTile(getPointerPos(this.editorCanvas, event));
        for (const codePoint of codePoints) {
            this.tileMap.setTile(coords, { codePoint: codePoint, color: color });
            coords.x++;
        }
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        this.tileMap.draw(this.ctx);
    }
}