import {LuaEngine, LuaFactory} from 'wasmoon'
import * as Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint'
import { Sprite } from './sprite'
import { CHAR_WIDTH, FRAME_TIME, FRAME_TIME_MS } from './constants'
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import SamJs from 'sam-js'
import { Camera } from './camera'
import { Game } from './game'
import glueUrl from 'wasmoon/dist/glue.wasm';
import PressPlay from './press-play.png';
import { Renderer } from './render'
import { Sound } from 'retro-sound'

let pressPlayImage = new Image();
pressPlayImage.src = PressPlay;

export class Engine {
    gameCanvas: HTMLCanvasElement;
    textToSpeech: SamJs;
    luaFactory: LuaFactory;
    downPointers: Set<number>;
    renderer: Renderer;
    audioContext: AudioContext;
    masterVolume: GainNode;
    game!: Game;
    sprites!: Sprite[];
    tileMap!: TileMap;
    camera!: Camera;
    matterEngine!: Matter.Engine;
    spriteDragConstraint!: SpriteDragConstraint;
    lua!: LuaEngine;
    currentSpeak: SamJsSpeakPromise | undefined;
    ranScript: boolean;
    luaFrame!: () => void;
    luaDrag!: (point: Util.Point) => void;
    luaTap!: () => void;
    constructor(gameCanvas: HTMLCanvasElement) {
        this.gameCanvas = gameCanvas;
        this.textToSpeech = new SamJs();
        this.luaFactory = new LuaFactory(glueUrl);
        this.renderer = new Renderer(this.gameCanvas);
        this.downPointers = new Set();
        this.audioContext = new AudioContext();
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.gain.setValueAtTime(0.25, 0);
        this.masterVolume.connect(this.audioContext.destination);
        this.audioContext.suspend();
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
        this.ranScript = false;
        this.sprites = [];
        const gameTileMap = TileMap.Copy(game.tileMap);
        const gamePatchMap = PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new Camera();
        if (this.currentSpeak) {
            this.currentSpeak.abort("Interrupted");
        }
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
        this.lua.global.set('say', (string: string) => {
            // Replace non-ascii and control characters with space
            const ascii = string.replace(/[^\x20-\x7E]/g, " ");
            if (this.currentSpeak) {
                this.currentSpeak.abort("Interrupted");
            }
            this.currentSpeak = this.textToSpeech.speak(ascii);
        });
        this.lua.global.set('beep', () => {
            const FM = new Sound(this.audioContext, 'triangle')
            .withModulator('square', 6, 600, 'detune')
            .withModulator('square', 12, 300, 'detune')
            .withFilter('lowpass', 1000)
            .toDestination(this.masterVolume);
            FM.play('A5')
            .rampToVolumeAtTime(0, 1)
            .waitDispose();
        })
        this.lua.global.set('camera', this.camera);
        // Start
        this.renderer.startRenderLoop(() => this.#doFrame());
    }
    setPaused(value: boolean) {
        this.renderer.paused = value;
        if (value) { 
            this.audioContext.suspend();
        }else{
            this.audioContext.resume();
        }
    }
    isPaused(): boolean {
        return this.renderer.paused;
    }
    #doFrame() {
        // Run Script
        if (!this.ranScript) {
            this.ranScript = true;
            // Load Script
            this.lua.doStringSync(this.game.script);
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