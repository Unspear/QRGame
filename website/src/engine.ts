import {LuaEngine, LuaFactory} from 'wasmoon'
import * as Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint'
import { Sprite } from './sprite'
import { CHAR_WIDTH, FRAME_TIME, FRAME_TIME_MS } from './constants'
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import { Camera } from './camera'
import { Game } from './game'
import glueUrl from 'wasmoon/dist/glue.wasm';
import PressPlay from './press-play.png';
import { Renderer } from './render'
import { AudioEngine, BufferSoundNode, FrequencyInput, OscillatorSoundNode, SoundMod } from './audio'

let pressPlayImage = new Image();
pressPlayImage.src = PressPlay;

export class Engine {
    gameCanvas: HTMLCanvasElement;
    gameErrors: HTMLDivElement;
    luaFactory: LuaFactory;
    downPointers: Set<number>;
    renderer: Renderer;
    audio: AudioEngine;
    #paused: boolean;
    game!: Game;
    sprites!: Sprite[];
    tileMap!: TileMap;
    camera!: Camera;
    matterEngine!: Matter.Engine;
    spriteDragConstraint!: SpriteDragConstraint;
    lua!: LuaEngine;
    ranScript: boolean;
    luaFrame!: () => void;
    luaDrag!: (point: Util.Point) => void;
    luaTap!: () => void;
    constructor(gameCanvas: HTMLCanvasElement, gameErrors: HTMLDivElement) {
        this.#paused = false;
        this.gameCanvas = gameCanvas;
        this.gameErrors = gameErrors;
        this.audio = new AudioEngine();
        this.luaFactory = new LuaFactory(glueUrl);
        this.renderer = new Renderer(this.gameCanvas);
        this.downPointers = new Set();
        this.ranScript = false;
        gameCanvas.addEventListener('pointerdown', (event: PointerEvent) => {
            this.downPointers.add(event.pointerId);
            if (this.luaDrag)
            {
                this.luaDrag(Util.getPointerPos(this.gameCanvas, event));
            }
            if (this.luaTap)
            {
                this.luaTap();
            }
        });
        gameCanvas.addEventListener('pointermove', (event) => {
            if (this.downPointers.has(event.pointerId))
            {
                if (this.luaDrag)
                {
                    this.luaDrag(Util.getPointerPos(this.gameCanvas, event));
                }
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.downPointers.delete(event.pointerId);
        });
        gameCanvas.addEventListener('drag', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragstart', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragend', (event) => event.preventDefault(), { passive: false });
    }
    async play(game: Game) {
        // Setup (should override any existing values)
        this.game = game;
        // Clear game errors
        this.gameErrors.textContent = '';
        this.ranScript = false;
        this.sprites = [];
        const gameTileMap = TileMap.Copy(game.tileMap);
        const gamePatchMap = PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new Camera();
        if (this.audio) {
            this.audio.close();
        }
        this.audio = new AudioEngine();
        // Create physics engine
        (Matter.Resolver as any)._restingThresh = 1;
        this.matterEngine = Matter.Engine.create({ 
            gravity: { scale: 0 }
        });
        // Create bodies
        const options = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 0.0,
            isStatic: true
        };
        for (let y = 0; y < this.tileMap.dim.h; y++) {
            for (let x = 0; x < this.tileMap.dim.w; x++) {
                const tile = this.tileMap.getTile({x: x, y: y})!;
                if (game.solidTiles.includes(tile.codePoint)) {
                    const physBody = Matter.Bodies.rectangle((x + 0.5) * CHAR_WIDTH, (y + 0.5) * CHAR_WIDTH, CHAR_WIDTH, CHAR_WIDTH, options);
                    Matter.Composite.add(this.matterEngine.world, physBody);
                }
            }
        }
        // Create sprite drag constraint
        this.spriteDragConstraint = new SpriteDragConstraint(this.matterEngine, this.gameCanvas);
        Matter.Composite.add(this.matterEngine.world, this.spriteDragConstraint.constraint);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('FRAME_TIME', FRAME_TIME);
        this.lua.global.set('createSprite', (char: string, color: number, x: number, y: number) => {
            let newSprite = new Sprite(char, color, x, y);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('destroySprite', (sprite: Sprite) => {
            this.sprites = this.sprites.filter(s => s !== sprite);
        });
        this.lua.global.set('copySprite', (sprite: Sprite) => {
            let newSprite = Sprite.Copy(sprite);
            this.sprites.push(newSprite);
            return newSprite;
        });
        // Simple Audio functions
        this.lua.global.set('say', (text: string) => {
            this.audio.makeSpeech(text).output();
        });
        this.lua.global.set('playSine', (note: string, length: number) => {
            this.audio.makeWave("sine", note, length).output();
        });
        this.lua.global.set('playSquare', (note: string, length: number) => {
            this.audio.makeWave("square", note, length).output();
        });
        this.lua.global.set('playSawtooth', (note: string, length: number) => {
            this.audio.makeWave("sawtooth", note, length).output();
        });
        this.lua.global.set('playTriangle', (note: string, length: number) => {
            this.audio.makeWave("triangle", note, length).output();
        });
        this.lua.global.set('playNoise', (length: number) => {
            this.audio.makeNoise(length).output();
        });
        this.lua.global.set('makeSpeech', (text: string): BufferSoundNode => {
            return this.audio.makeSpeech(text);
        });
        this.lua.global.set('makeWave', (type: OscillatorType, frequency: FrequencyInput, length: number): OscillatorSoundNode => {
            return this.audio.makeWave(type, frequency, length);
        });
        this.lua.global.set('makeNoise', (length: number): BufferSoundNode => {
            return this.audio.makeNoise(length);
        });
        this.lua.global.set('modLinear', (value: number, duration: number): SoundMod => {
            return new SoundMod("linear", value, duration);
        });
        this.lua.global.set('modExp', (value: number, duration: number): SoundMod => {
            return new SoundMod("exponential", value, duration);
        });
        this.lua.global.set('modStep', (value: number, duration: number): SoundMod => {
            return new SoundMod("step", value, duration);
        });
        this.lua.global.set('camera', this.camera);
        // Start
        this.renderer.startRenderLoop(() => this.#doFrame());
    }
    setPaused(value: boolean) {
        this.#paused = value;
        this.renderer.paused = value;
        this.audio.setPaused(value);
    }
    get paused(): boolean {
        return this.#paused;
    }
    #doFrame() {
        // Run Script
        if (!this.ranScript) {
            this.ranScript = true;
            // Load Script
            try {
                this.lua.doStringSync(this.game.script);
            } catch(error: any) {
                let p = document.createElement("p");
                p.innerText = `${error}`;
                this.gameErrors.appendChild(p);
            }
            // Get Lua References
            this.luaFrame = this.lua.global.get('frame');
            this.luaTap = this.lua.global.get('tap');
            this.luaDrag = this.lua.global.get('drag');
        }
        // Frame
        if (this.luaFrame)
        {
            this.luaFrame();
        }
        // Physics
        for (let sprite of this.sprites) {
            sprite.prePhysicsUpdate(this.matterEngine)
        }
        Matter.Engine.update(this.matterEngine, FRAME_TIME_MS);
        for (let sprite of this.sprites) {
            sprite.postPhysicsUpdate(this.matterEngine)
        }
        // Rendering
        // Fill Background
        this.renderer.beginFrame();
        this.renderer.viewOffset = this.camera.getViewOffset();
        // Draw Tilemap
        this.tileMap.draw(this.renderer);
        // Draw Sprites
        for (let sprite of this.sprites) {
            sprite.draw(this.renderer)
        }
        this.renderer.endFrame();
    }
}