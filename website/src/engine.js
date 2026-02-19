import {LuaFactory} from 'wasmoon'
import Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint.js'
import { Sprite } from './sprite.js'
import { FRAME_TIME, FRAME_TIME_MS } from './constants'
import { TileMap } from './tile'
import * as Util from './util'
import SamJs from 'sam-js'
import { Camera } from './camera.js'

export class Engine {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.textToSpeech = new SamJs();
        this.luaFactory = new LuaFactory();
        this.ctx = gameCanvas.getContext('2d');
        this.downPointers = new Set();
        gameCanvas.addEventListener('pointerdown', (event) => {
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
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        this.tileMap = TileMap.Copy(game.tileMap);
        this.camera = new Camera();
        // Create physics engine
        Matter.Resolver._restingThresh = 1;
        this.matterEngine = Matter.Engine.create({ 
            gravity: { scale: 0 }
        });
        this.spriteDragConstraint = SpriteDragConstraint.create(this.matterEngine, this.gameCanvas);
        Matter.Composite.add(this.matterEngine.world, this.spriteDragConstraint.constraint);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('FRAME_TIME', FRAME_TIME);
        this.lua.global.set('createSprite', (char, color, x, y) => {
            let newSprite = new Sprite(char, color, x, y);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('destroySprite', (sprite) => {
            this.sprites = this.sprites.filter(s => s !== sprite);
        });
        this.lua.global.set('copySprite', (sprite) => {
            let newSprite = Sprite.Copy(sprite);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('say', (string) => {
            this.textToSpeech.speak(string);
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
    #mainLoop(timestamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > FRAME_TIME_MS) {
            if (this.gameCanvas.checkVisibility()) {
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
                this.ctx.beginPath();
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
    #previousTimestamp;
}