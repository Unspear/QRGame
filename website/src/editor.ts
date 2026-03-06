import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import { Camera } from './camera';
import { Game } from './game';
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import { MyTabElement } from './tab';

enum EditorState {
    Brush,
    Pipette,
}

const TabDrawTile = "draw-tile";
const TabDrawPatch = "draw-patch";

export class Editor {
    // Code
    scriptInput: EditorView;
    // Canvas
    canvas: HTMLCanvasElement;
    // Tabs
    tileMapTab: MyTabElement;
    // Settings
    widthInput: HTMLInputElement;
    heightInput: HTMLInputElement;
    patchCountInput: HTMLInputElement;
    patchWidthInput: HTMLInputElement;
    patchHeightInput: HTMLInputElement;
    applySettingsButton: HTMLButtonElement;
    // Draw Tilemap
    charInput: HTMLInputElement;
    colorInput: HTMLInputElement;
    invertedInput: HTMLInputElement;
    invertedLabel: HTMLSpanElement;
    pipetteButton: HTMLButtonElement;
    // Draw Patchmap
    patchIdInput: HTMLInputElement;
    // Physics
    solidCharInput: HTMLInputElement;
    // Camera
    leftButton: HTMLButtonElement;
    upButton: HTMLButtonElement;
    rightButton: HTMLButtonElement;
    downButton: HTMLButtonElement;
    // Import/Export
    exportButton: HTMLButtonElement;
    importButton: HTMLButtonElement;
    // Other
    ctx: CanvasRenderingContext2D;
    heldDown: boolean;
    camera: Camera;
    tileMap: TileMap;
    patchMap: PatchMap;
    state: EditorState;
    constructor(inputGame: Game) {
        this.state = EditorState.Brush;
        //Code
        const codeContent = document.getElementById('tab-content-code') as HTMLElement;
        this.scriptInput = new EditorView({
            extensions: [basicSetup, StreamLanguage.define(lua)],
            parent: codeContent
        })
        //Canvas
        this.canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
        //Tabs
        this.tileMapTab = document.getElementById('tilemap-tab') as MyTabElement;
        //Settings
        this.widthInput = document.getElementById('tilemap-width') as HTMLInputElement;
        this.heightInput = document.getElementById('tilemap-height') as HTMLInputElement;
        this.patchCountInput = document.getElementById('patch-count') as HTMLInputElement;
        this.patchWidthInput = document.getElementById('patch-width') as HTMLInputElement;
        this.patchHeightInput = document.getElementById('patch-height') as HTMLInputElement;
        this.applySettingsButton = document.getElementById('tilemap-settings-apply') as HTMLButtonElement;
        //Drawing
        this.charInput = document.getElementById('editor-char-input') as HTMLInputElement;
        this.colorInput = document.getElementById('editor-color-input') as HTMLInputElement;
        this.invertedInput = document.getElementById('editor-invert-input') as HTMLInputElement;
        this.invertedLabel = document.getElementById('editor-invert-label') as HTMLSpanElement;
        this.pipetteButton = document.getElementById('editor-pipette-button') as HTMLButtonElement;
        //Patch Drawing
        this.patchIdInput = document.getElementById('patch-id') as HTMLInputElement;
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
        this.heldDown = false;
        this.camera = new Camera();
        // Place tile while pointer is held
        this.canvas.addEventListener('pointerdown', (event) => {
            this.heldDown = true;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                    this.setTileFromEvent(event);
                    this.draw();
                } else {
                    this.setBrushFromEvent(event);
                }
            } else if (this.tileMapTab.currentTab === TabDrawPatch){
                this.setPatchFromEvent(event);
                this.draw();
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.heldDown = false;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                    this.draw();
                } else {
                    this.state = EditorState.Brush;
                }
            } else if (this.tileMapTab.currentTab === TabDrawPatch) {
                this.draw();
            }
        });
        this.canvas.addEventListener('pointermove', (event) => {
            if (this.heldDown) {
                if (this.tileMapTab.currentTab === TabDrawTile) {
                    if (this.state === EditorState.Brush) {
                        this.setTileFromEvent(event);
                        this.draw();
                    }
                } else if (this.tileMapTab.currentTab === TabDrawPatch) {
                    this.setPatchFromEvent(event);
                    this.draw();
                }
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        this.canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        let that = this;
        this.tileMapTab.updateListeners.push(function(currentTab: string): void {
            that.draw();
        });
        this.applySettingsButton.onclick = function(){
            // Make new tilemap with new size and copy data
            const patchDim = {
                w: that.getAndValidateInputNumber(that.patchWidthInput, 1, 32, 1),
                h: that.getAndValidateInputNumber(that.patchHeightInput, 1, 32, 1),
            };
            const newPatchCount = that.getAndValidateInputNumber(that.patchCountInput, 1, 128, 1);
            const newTileMap = new TileMap(patchDim, newPatchCount);
            for (let y = 0; y < patchDim.h; y++) {
                for (let x = 0; x < patchDim.w; x++) {
                    const coords = {x: x, y: y};
                    const getTileResult = that.tileMap.getTile(coords);
                    if (getTileResult !== null) {
                        newTileMap.setTile(getTileResult, coords);
                    }
                }
            }
            that.tileMap = newTileMap;

            const newDim = {
                w: that.getAndValidateInputNumber(that.widthInput, 1, 128, 1),
                h: that.getAndValidateInputNumber(that.heightInput, 1, 128, 1),
            };
            const newPatchMap = new PatchMap(newDim);
            for (let y = 0; y < newDim.h; y++) {
                for (let x = 0; x < newDim.w; x++) {
                    const coords = {x: x, y: y};
                    const getPatchResult = that.patchMap.getPatch(coords);
                    if (getPatchResult !== null) {
                        newPatchMap.setPatch(getPatchResult, coords);
                    }
                }
            }
            that.patchMap = newPatchMap;
            that.draw();
        };
        this.leftButton.onclick = function(){that.camera.x -= 64; that.updateCamera();};
        this.upButton.onclick = function(){that.camera.y -= 64; that.updateCamera();};
        this.rightButton.onclick = function(){that.camera.x += 64; that.updateCamera();};
        this.downButton.onclick = function(){that.camera.y += 64; that.updateCamera();};
        this.exportButton.onclick = function(){
            let serialised = JSON.stringify({tileMap: that.tileMap, patchMap: that.patchMap});
            navigator.clipboard.writeText(serialised);
        };
        this.importButton.onclick = async function(){
            try {
                let serialised = JSON.parse(await navigator.clipboard.readText());
                that.tileMap = TileMap.Copy(serialised.tileMap as TileMap);
                that.patchMap = PatchMap.Copy(serialised.patchMap as PatchMap);
                that.draw();
            } catch(err) {
                alert("Failed to load tilemap from clipboard, are you sure it is in the clipboard and correctly formatted?")
            }
        }
        this.invertedLabel.classList.toggle("hidden", !this.invertedInput.checked);
        this.invertedInput.onchange = function() {
            that.invertedLabel.classList.toggle("hidden", !that.invertedInput.checked);
        };
        this.pipetteButton.onclick = function() {
            that.state = EditorState.Pipette;
        };
        // Load input game into editor
        const transaction = this.scriptInput.state.update({changes: {
            from: 0, 
            to: this.scriptInput.state.doc.length, 
            insert: inputGame.script
        }});
        this.scriptInput.update([transaction]);
        this.tileMap = TileMap.Copy(inputGame.tileMap);
        this.patchMap = PatchMap.Copy(inputGame.patchMap);
        this.patchWidthInput.valueAsNumber = this.tileMap.dim.w;
        this.patchHeightInput.valueAsNumber = this.tileMap.dim.h;
        this.patchCountInput.valueAsNumber = this.tileMap.count;
        this.widthInput.valueAsNumber = this.patchMap.dim.w;
        this.heightInput.valueAsNumber = this.patchMap.dim.h;
        this.solidCharInput.value = String.fromCodePoint(...inputGame.solidTiles);
        // Update Canvas
        this.draw();
    }
    getAndValidateInputNumber(input: HTMLInputElement, min: number, max: number, step: number): number {
        let value = input.valueAsNumber;
        value = Util.clamp(Math.ceil(value / step) * step, min, max);
        input.valueAsNumber = value;
        return value;
    }
    getCoordFromEvent(event: PointerEvent): Util.Point {
        let pixel = Util.getPointerPos(this.canvas, event);
        let viewOffset = this.camera.getViewOffset();
        pixel.x -= viewOffset.x;
        pixel.y -= viewOffset.y;
        return Util.pixelToTile(pixel);
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
        let pair = this.tileMap.getSplitCoords(this.getCoordFromEvent(event));
        for (const codePoint of codePoints) {
            this.tileMap.setTile({ codePoint: codePoint, color: color }, pair.coords, pair.patchIndex);
            pair.coords.x++;
        }
    }
    setPatchFromEvent(event: PointerEvent) {
        this.patchMap.setPatch({ patchId: this.patchIdInput.valueAsNumber, transform: 0 }, this.getCoordFromEvent(event));
    }
    setBrushFromEvent(event: PointerEvent) {
        let coords = this.getCoordFromEvent(event);
        let tileData = this.tileMap.getTile(coords);
        if (tileData !== null) {
            this.charInput.value = String.fromCodePoint(tileData.codePoint);
            this.colorInput.value = (tileData.color % 8).toString();
            this.invertedInput.checked = tileData.color > 8;
        }
    }
    updateCamera() {
        this.camera.frame(1000.0);
        this.draw();
    }
    draw() {
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.tileMapTab.currentTab === TabDrawPatch) {
            this.patchMap.draw(this.ctx, this.camera.getViewOffset());
            this.patchMap.drawOutline(this.ctx, this.camera.getViewOffset());
        } else {
            this.tileMap.draw(this.ctx, this.camera.getViewOffset());
            this.tileMap.drawOutline(this.ctx, this.camera.getViewOffset());
        }
    }
    getGame(): Game {
        let game = new Game(this.scriptInput.state.doc.toString(), this.tileMap, this.patchMap);
        game.solidTiles = Util.stringToCodePoints(this.solidCharInput.value);
        return game;
    }
}