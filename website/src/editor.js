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

export class Editor {
    constructor(editorCanvas, editorCharInput) {
        this.editorCanvas = editorCanvas;
        this.editorCharInput = editorCharInput;
        this.ctx = editorCanvas.getContext('2d');
        this.placingTiles = false;
        let that = this;
        this.pointerDown = function(e) {
            that.placingTiles = true;
            that.setTile(that.getTileFromInput(), pixelToTile(getPointerPos(editorCanvas, e)));
            that.draw();
            if (e.changedTouches) {
                e.preventDefault();
            }
        }
        this.pointerUp = function(e) {
            that.placingTiles = false;
            that.draw();
            if (e.changedTouches) {
                e.preventDefault();
            }
        }
        this.pointerMove = function(e) {
            if (that.placingTiles) {
                that.setTile(that.getTileFromInput(), pixelToTile(getPointerPos(editorCanvas, e)));
                that.draw();
                if (e.changedTouches) {
                    e.preventDefault();
                }
            }
        }
        editorCanvas.addEventListener('mousemove', this.pointerMove, { passive: true });
        editorCanvas.addEventListener('mousedown', this.pointerDown, { passive: true });
        editorCanvas.addEventListener('mouseup', this.pointerUp, { passive: true });
        editorCanvas.addEventListener('touchmove', this.pointerMove, { passive: false });
        editorCanvas.addEventListener('touchstart', this.pointerDown, { passive: false });
        editorCanvas.addEventListener('touchend', this.pointerUp, { passive: false });
        this.tiles = Array(16 * 12).fill(' ');
        this.draw();
    }
    getTileFromInput() {
        if (this.editorCharInput.value.length > 0) {
            return String.fromCodePoint(this.editorCharInput.value.codePointAt(0));
        }
        return ' ';
    }
    setTile(char, coords) {
        this.tiles[coords.y * 12 + coords.x] = char;
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        charRenderer.draw(this.ctx, this.tiles, 0, 0, '#ffffff', 12, false);
    }
}