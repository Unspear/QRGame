import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import { Camera } from './camera';
import { Game } from './game';
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import { MyTabElement } from './tab';
import { Renderer } from './render';
import { CHAR_WIDTH, FRAME_TIME, SCREEN_DIM } from './constants';

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
    // Info
    infoTitle: HTMLInputElement;
    infoDescription: HTMLInputElement;
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
    renderer: Renderer;
    heldDown: boolean;
    patchCamera: Camera;
    tileCamera: Camera;
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
        //Info
        this.infoTitle = document.getElementById('info-title') as HTMLInputElement;
        this.infoDescription = document.getElementById('info-description') as HTMLInputElement;
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
        this.renderer = new Renderer(this.canvas);
        this.heldDown = false;
        this.patchCamera = new Camera();
        this.tileCamera = new Camera();
        // Place tile while pointer is held
        this.canvas.addEventListener('pointerdown', (event) => {
            this.heldDown = true;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                    this.setTileFromEvent(event);
                } else {
                    this.setBrushFromEvent(event);
                }
            } else if (this.tileMapTab.currentTab === TabDrawPatch){
                this.setPatchFromEvent(event);
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.heldDown = false;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                } else {
                    this.state = EditorState.Brush;
                }
            } else if (this.tileMapTab.currentTab === TabDrawPatch) {
            }
        });
        this.canvas.addEventListener('pointermove', (event) => {
            if (this.heldDown) {
                if (this.tileMapTab.currentTab === TabDrawTile) {
                    if (this.state === EditorState.Brush) {
                        this.setTileFromEvent(event);
                    }
                } else if (this.tileMapTab.currentTab === TabDrawPatch) {
                    this.setPatchFromEvent(event);
                }
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        this.canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        this.tileMapTab.updateListeners.push(function(currentTab: string): void {
        });
        this.applySettingsButton.onclick = () => {
            // Make new tilemap with new size and copy data
            const patchDim = {
                w: this.getAndValidateInputNumber(this.patchWidthInput, 1, 32, 1),
                h: this.getAndValidateInputNumber(this.patchHeightInput, 1, 32, 1),
            };
            const newPatchCount = this.getAndValidateInputNumber(this.patchCountInput, 1, 128, 1);
            const newTileMap = new TileMap(patchDim, newPatchCount);
            for (let i = 0; i < newPatchCount; i++) {
                for (let y = 0; y < patchDim.h; y++) {
                    for (let x = 0; x < patchDim.w; x++) {
                        const coords = {x: x, y: y};
                        const getTileResult = this.tileMap.getTile(coords, i);
                        if (getTileResult !== null) {
                            newTileMap.setTile(getTileResult, coords, i);
                        }
                    }
                }     
            }
            this.tileMap = newTileMap;
            this.tileCamera.setLevelDim(this.tileMap.getDrawDim());
            const newDim = {
                w: this.getAndValidateInputNumber(this.widthInput, 1, 128, 1),
                h: this.getAndValidateInputNumber(this.heightInput, 1, 128, 1),
            };
            const newPatchMap = new PatchMap(newDim);
            for (let y = 0; y < newDim.h; y++) {
                for (let x = 0; x < newDim.w; x++) {
                    const coords = {x: x, y: y};
                    const getPatchResult = this.patchMap.getPatch(coords);
                    if (getPatchResult !== null) {
                        newPatchMap.setPatch(getPatchResult, coords);
                    }
                }
            }
            this.patchMap = newPatchMap;
            this.patchCamera.setLevelDim(this.patchMap.getDrawDim(this.tileMap));
        };
        this.leftButton.onclick = () => {this.getCurrentCamera().x -= 64;};
        this.upButton.onclick = () => {this.getCurrentCamera().y -= 64;};
        this.rightButton.onclick = () => {this.getCurrentCamera().x += 64;};
        this.downButton.onclick = () => {this.getCurrentCamera().y += 64;};
        this.exportButton.onclick = () => {
            let serialised = JSON.stringify({tileMap: this.tileMap, patchMap: this.patchMap});
            navigator.clipboard.writeText(serialised);
        };
        this.importButton.onclick = async () => {
            try {
                let serialised = JSON.parse(await navigator.clipboard.readText());
                this.tileMap = TileMap.Copy(serialised.tileMap as TileMap);
                this.patchMap = PatchMap.Copy(serialised.patchMap as PatchMap);
            } catch(err) {
                alert("Failed to load tilemap from clipboard, are you sure it is in the clipboard and correctly formatted?")
            }
        }
        this.invertedLabel.classList.toggle("hidden", !this.invertedInput.checked);
        this.invertedInput.onchange = () => {
            this.invertedLabel.classList.toggle("hidden", !this.invertedInput.checked);
        };
        this.pipetteButton.onclick = () => {
            this.state = EditorState.Pipette;
        };
        // Load input game into editor
        this.infoTitle.value = inputGame.metadata.title;
        this.infoDescription.value = inputGame.metadata.description;
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
        this.patchCamera.setLevelDim(this.patchMap.getDrawDim(this.tileMap));
        this.tileCamera.setLevelDim(this.tileMap.getDrawDim());
        this.solidCharInput.value = String.fromCodePoint(...inputGame.solidTiles);
        this.renderer.startRenderLoop(() => this.draw());
    }
    getAndValidateInputNumber(input: HTMLInputElement, min: number, max: number, step: number): number {
        let value = input.valueAsNumber;
        value = Util.clamp(Math.ceil(value / step) * step, min, max);
        input.valueAsNumber = value;
        return value;
    }
    getCoordFromEvent(event: PointerEvent): Util.Point {
        let pixel = Util.getPointerPos(this.canvas, event);
        let viewOffset = this.getCurrentCamera().getViewOffset();
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
        const point = this.getCoordFromEvent(event);
        point.x = Math.floor(point.x / this.tileMap.dim.w);
        point.y = Math.floor(point.y / this.tileMap.dim.h);
        this.patchMap.setPatch({ patchId: this.patchIdInput.valueAsNumber, transform: 0 }, point);
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
    getCurrentCamera() {
        return (this.tileMapTab.currentTab === TabDrawPatch) ? this.patchCamera : this.tileCamera;
    }
    draw() {
        this.renderer.beginFrame();
        this.renderer.viewOffset = this.getCurrentCamera().getViewOffset();
        if (this.tileMapTab.currentTab === TabDrawPatch) {
            this.patchMap.draw(this.renderer, this.tileMap, true);
        } else {
            this.tileMap.draw(this.renderer, true);
        }
        this.renderer.endFrame();
    }
    getGame(): Game {
        let game = new Game(
            {
                title: this.infoTitle.value, 
                description: this.infoDescription.value
            },
            this.scriptInput.state.doc.toString(),
            this.tileMap,
            this.patchMap
        );
        game.solidTiles = Util.stringToCodePoints(this.solidCharInput.value);
        return game;
    }
}