import {LuaFactory} from 'wasmoon'
import Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint.js'
import { Sprite } from './sprite.js'
import { FRAME_TIME, FRAME_TIME_MS } from './constants.js'
import { TileMap } from './tile.js'
import * as Util from './util.js'

export class Engine {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
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
    }
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        this.tileMap = TileMap.Copy(game.tileMap);
        // Create physics engine
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
                this.tileMap.draw(this.ctx);
                // Draw Sprites
                for (let sprite of this.sprites) {
                    sprite.draw(this.ctx)
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