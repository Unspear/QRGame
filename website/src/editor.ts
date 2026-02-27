import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import { Camera } from './camera';
import { Game } from './game';
import { TileMap } from './tile'
import * as Util from './util'

export class Editor {
    scriptInput: EditorView;
    canvas: HTMLCanvasElement;
    widthInput: HTMLInputElement;
    heightInput: HTMLInputElement;
    changeSizeButton: HTMLButtonElement;
    charInput: HTMLInputElement;
    colorInput: HTMLInputElement;
    invertedInput: HTMLInputElement;
    solidCharInput: HTMLInputElement;
    leftButton: HTMLButtonElement;
    upButton: HTMLButtonElement;
    rightButton: HTMLButtonElement;
    downButton: HTMLButtonElement;
    exportButton: HTMLButtonElement;
    importButton: HTMLButtonElement
    ctx: CanvasRenderingContext2D;
    placingTiles: boolean;
    camera: Camera;
    tileMap: TileMap;
    constructor(inputGame: Game) {
        //Code
        const codeContent = document.getElementById('tab-content-code') as HTMLElement;
        this.scriptInput = new EditorView({
            extensions: [basicSetup, StreamLanguage.define(lua)],
            parent: codeContent
        })
        //Canvas
        this.canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
        //Settings
        this.widthInput = document.getElementById('tilemap-width') as HTMLInputElement;
        this.heightInput = document.getElementById('tilemap-height') as HTMLInputElement;
        this.changeSizeButton = document.getElementById('tilemap-change-size') as HTMLButtonElement;
        //Drawing
        this.charInput = document.getElementById('editor-char-input') as HTMLInputElement;
        this.colorInput = document.getElementById('editor-color-input') as HTMLInputElement;
        this.invertedInput = document.getElementById('editor-invert-input') as HTMLInputElement;
        //Physics
        this.solidCharInput = document.getElementById('editor-solid-input') as HTMLInputElement;
        //Camera
        this.leftButton = document.getElementById('left-button') as HTMLButtonElement;
        this.upButton = document.getElementById('up-button') as HTMLButtonElement;
        this.rightButton = document.getElementById('right-button') as HTMLButtonElement;
        this.downButton = document.getElementById('down-button') as HTMLButtonElement;
        //Import/Export
        this.exportButton = document.getElementById('export-button') as HTMLButtonElement;
        this.importButton = document.getElementById('import-button') as HTMLButtonElement;
        this.ctx = this.canvas.getContext('2d')!;
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
        this.changeSizeButton.onclick = function(){
            // Make new tilemap with new size and copy data
            const newDim = that.getAndValidateDimensionsFromInput();
            const newTileMap = new TileMap(newDim);
            for (let y = 0; y < newDim.h; y++) {
                for (let x = 0; x < newDim.w; x++) {
                    const coords = {x: x, y: y};
                    const getTileResult = that.tileMap.getTile(coords);
                    if (getTileResult !== null) {
                        newTileMap.setTile(coords, getTileResult);
                    }
                }
            }
            that.tileMap = newTileMap;
            that.draw();
        };
        this.leftButton.onclick = function(){that.camera.x -= 64; that.updateCamera();};
        this.upButton.onclick = function(){that.camera.y -= 64; that.updateCamera();};
        this.rightButton.onclick = function(){that.camera.x += 64; that.updateCamera();};
        this.downButton.onclick = function(){that.camera.y += 64; that.updateCamera();};
        this.exportButton.onclick = function(){
            let serialised = JSON.stringify(that.tileMap);
            navigator.clipboard.writeText(serialised);
        };
        this.importButton.onclick = async function(){
            try {
                let serialised = JSON.parse(await navigator.clipboard.readText());
                that.tileMap = TileMap.Copy(serialised as TileMap);
            } catch(err) {
                alert("Failed to load tilemap from clipboard, are you sure it is in the clipboard and correctly formatted?")
            }
        }
        // Load input game into editor
        const transaction = this.scriptInput.state.update({changes: {
            from: 0, 
            to: this.scriptInput.state.doc.length, 
            insert: inputGame.script
        }});
        this.scriptInput.update([transaction]);
        this.tileMap = TileMap.Copy(inputGame.tileMap);
        this.widthInput.valueAsNumber = this.tileMap.dim.w;
        this.heightInput.valueAsNumber = this.tileMap.dim.h;
        this.solidCharInput.value = String.fromCodePoint(...this.tileMap.solidTiles);
        // Update Canvas
        this.draw();
    }
    getAndValidateDimensionsFromInput(): Util.Dimensions {
        const newDim = {w: this.widthInput.valueAsNumber, h: this.heightInput.valueAsNumber};
        newDim.w = Util.clamp(Math.ceil(newDim.w / 4) * 4, 12, 128);
        newDim.h = Util.clamp(Math.ceil(newDim.h / 4) * 4, 16, 128);
        this.widthInput.valueAsNumber = newDim.w;
        this.heightInput.valueAsNumber = newDim.h;
        return newDim;
    }
    setTileFromEvent(event: PointerEvent) {
        // Get array of codepoints
        let codePoints = [...this.charInput.value].map(c => c.codePointAt(0) ?? 0);
        let color = parseInt(this.colorInput.value);
        const inverted = this.invertedInput.checked;
        if (inverted) {
            color += 8;
        }
        if (codePoints.length == 0) {
            // Erase
            codePoints = [' '.codePointAt(0)!];
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
    getGame(): Game {
        this.tileMap.solidTiles = Util.stringToCodePoints(this.solidCharInput.value);
        return new Game(this.scriptInput.state.doc.toString(), this.tileMap);
    }
}