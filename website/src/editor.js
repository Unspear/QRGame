import { Game } from './game.js'
import charRenderer from './render.js'
import { TileMap } from './tile.js'
import * as Util from './util.js'

export class Editor {
    constructor() {
        this.canvas = document.getElementById('editor-canvas');
        this.charInput = document.getElementById('editor-char-input');;
        this.colorInput = document.getElementById('editor-color-input');
        this.invertedInput = document.getElementById('editor-invert-input');
        this.leftButton = document.getElementById('left-button');
        this.upButton = document.getElementById('up-button');
        this.rightButton = document.getElementById('right-button');
        this.downButton = document.getElementById('down-button');
        this.ctx = this.canvas.getContext('2d');
        this.placingTiles = false;
        this.viewPos = {x: 0, y: 0};
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
        this.leftButton.onclick = function(){that.viewPos.x -= 4; that.draw();};
        this.upButton.onclick = function(){that.viewPos.y -= 4; that.draw();};
        this.rightButton.onclick = function(){that.viewPos.x += 4; that.draw();};
        this.downButton.onclick = function(){that.viewPos.y += 4; that.draw();};
        this.tileMap = new TileMap({ w: 32, h: 32 });
        this.draw();
    }
    setTileFromEvent(event) {
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
        let coords = Util.pixelToTile(Util.getPointerPos(this.canvas, event));
        coords.x += this.viewPos.x;
        coords.y += this.viewPos.y;
        for (const codePoint of codePoints) {
            this.tileMap.setTile(coords, { codePoint: codePoint, color: color });
            coords.x++;
        }
    }
    draw() {
        this.ctx.beginPath();
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.tileMap.draw(this.ctx, this.viewPos);
    }
}