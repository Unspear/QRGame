import {LuaEngine, LuaFactory} from 'wasmoon'
import * as Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint'
import { Sprite } from './sprite'
import { FRAME_TIME, FRAME_TIME_MS } from './constants'
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import SamJs from 'sam-js'
import { Camera } from './camera'
import { Game } from './game'
import glueUrl from 'wasmoon/dist/glue.wasm';
import PressPlay from './press-play.png';

let pressPlayImage = new Image();
pressPlayImage.src = PressPlay;

export class Engine {
    gameCanvas: HTMLCanvasElement;
    textToSpeech: SamJs;
    luaFactory: LuaFactory;
    ctx: CanvasRenderingContext2D;
    downPointers: Set<number>;
    luaDrag!: (point: Util.Point) => void;
    luaTap!: () => void;
    game!: Game;
    sprites!: Sprite[];
    tileMap!: TileMap;
    camera!: Camera;
    matterEngine!: Matter.Engine;
    spriteDragConstraint!: SpriteDragConstraint;
    lua!: LuaEngine;
    luaFrame!: () => void;
    paused: boolean;
    constructor(gameCanvas: HTMLCanvasElement) {
        this.gameCanvas = gameCanvas;
        this.textToSpeech = new SamJs();
        this.luaFactory = new LuaFactory(glueUrl);
        this.ctx = gameCanvas.getContext('2d')!;
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.ctx.fillStyle = "white";
        this.ctx.drawImage(pressPlayImage, 0, 0);
        this.downPointers = new Set();
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
        this.paused = true;
    }
    async play(game: Game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        const gameTileMap = TileMap.Copy(game.tileMap);
        const gamePatchMap = PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new Camera();
        // Create physics engine
        (Matter.Resolver as any)._restingThresh = 1;
        this.matterEngine = Matter.Engine.create({ 
            gravity: { scale: 0 }
        });
        this.tileMap.createBodies(this.matterEngine, game.solidTiles);
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
            this.textToSpeech.speak(ascii);
        });
        this.lua.global.set('camera', this.camera);
        // Load Script
        this.lua.doStringSync(this.game.script);
        // Get Lua References
        this.luaFrame = this.lua.global.get('frame');
        this.luaTap = this.lua.global.get('tap');
        this.luaDrag = this.lua.global.get('drag');
        // Start
        requestAnimationFrame(this.#mainLoop.bind(this));
    }
    setPaused(value: boolean) {
        this.paused = value;
    }
    isPaused(): boolean {
        return this.paused;
    }
    #mainLoop(timestamp: DOMHighResTimeStamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > FRAME_TIME_MS) {
            if (this.gameCanvas.checkVisibility() && !this.paused) {
                // Frame
                if (this.luaFrame)
                {
                    this.luaFrame();
                }
                this.camera.frame(FRAME_TIME)
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
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
                // Draw Tilemap
                let viewOffset = this.camera.getViewOffset();
                this.tileMap.draw(this.ctx, viewOffset);
                // Draw Sprites
                for (let sprite of this.sprites) {
                    sprite.draw(this.ctx, viewOffset)
                }
            }
            if (elapsed > FRAME_TIME_MS * 5) {
                console.log("Elapsed time is large, skipping frames")
                this.#previousTimestamp = timestamp;
            } else {
                this.#previousTimestamp += FRAME_TIME_MS;
            }
        }
        requestAnimationFrame((t) => this.#mainLoop(t));
    }
    #previousTimestamp: DOMHighResTimeStamp | undefined;
}