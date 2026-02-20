import { Camera } from './camera.js';
import { Game } from './game'
import charRenderer from './render'
import { TileMap } from './tile'
import * as Util from './util'

export class Editor {
    canvas: HTMLCanvasElement;
    charInput: HTMLInputElement;
    colorInput: HTMLInputElement;
    invertedInput: HTMLInputElement;
    leftButton: HTMLButtonElement;
    upButton: HTMLButtonElement;
    rightButton: HTMLButtonElement;
    downButton: HTMLButtonElement;
    ctx: CanvasRenderingContext2D;
    placingTiles: boolean;
    camera: Camera;
    tileMap: TileMap;
    constructor() {
        this.canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
        this.charInput = document.getElementById('editor-char-input') as HTMLInputElement;
        this.colorInput = document.getElementById('editor-color-input') as HTMLInputElement;
        this.invertedInput = document.getElementById('editor-invert-input') as HTMLInputElement;
        this.leftButton = document.getElementById('left-button') as HTMLButtonElement;
        this.upButton = document.getElementById('up-button') as HTMLButtonElement;
        this.rightButton = document.getElementById('right-button') as HTMLButtonElement;
        this.downButton = document.getElementById('down-button') as HTMLButtonElement;
        this.ctx = this.canvas.getContext('2d');
        this.placingTiles = false;
        this.camera = new Camera();
        // Place tile while pointer is held
        this.canvas.addEventListener('pointerdown', (event) => {
            this.placingTiles = true;
            this.setTileFromEvent(event);
            this.draw();
        });
        window.addEventListener('pointerup', (event) => {
            this.placingTiles = false;
            this.draw();
        });
        this.canvas.addEventListener('pointermove', (event) => {
            if (this.placingTiles) {
                this.setTileFromEvent(event);
                this.draw();
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        this.canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        let that = this;
        this.leftButton.onclick = function(){that.camera.x -= 64; that.updateCamera();};
        this.upButton.onclick = function(){that.camera.y -= 64; that.updateCamera();};
        this.rightButton.onclick = function(){that.camera.x += 64; that.updateCamera();};
        this.downButton.onclick = function(){that.camera.y += 64; that.updateCamera();};
        this.tileMap = new TileMap({ w: 32, h: 32 });
        this.draw();
    }
    setTileFromEvent(event: PointerEvent) {
        // Get array of codepoints
        let codePoints = [...this.charInput.value].map(c => c.codePointAt(0));
        let color = parseInt(this.colorInput.value);
        const inverted = this.invertedInput.checked;
        if (inverted) {
            color += 8;
        }
        if (codePoints.length == 0) {
            // Erase
            codePoints = [' '.codePointAt(0)];
        }
        // Draw array to tilemap
        let pixel = Util.getPointerPos(this.canvas, event);
        let viewOffset = this.camera.getViewOffset();
        pixel.x -= viewOffset.x;
        pixel.y -= viewOffset.y;
        let coords = Util.pixelToTile(pixel);
        for (const codePoint of codePoints) {
            this.tileMap.setTile(coords, { codePoint: codePoint, color: color });
            coords.x++;
        }
    }
    updateCamera() {
        this.camera.frame(1000.0);
        this.draw();
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.tileMap.draw(this.ctx, this.camera.getViewOffset());
    }
}