import {LuaFactory} from 'wasmoon'
import Matter from 'matter-js'
import { SpriteDragConstraint } from './spriteDragConstraint.js'
import { Sprite } from './sprite.js'
import { FRAME_TIME, FRAME_TIME_MS } from './constants.js'
import { TileMap } from './tile.js'

export class Engine {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.luaFactory = new LuaFactory();
        this.matterEngine = Matter.Engine.create({});
        this.matterEngine.gravity.scale = 0;
        this.spriteDragConstraint = SpriteDragConstraint.create(this.matterEngine, this.gameCanvas);
        Matter.Composite.add(this.matterEngine.world, this.spriteDragConstraint.constraint);
        this.ctx = gameCanvas.getContext('2d');
        gameCanvas.addEventListener('pointerdown', (event) => {
            if (this.luaTap)
            {
                this.luaTap();
            }
        });
    }
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        this.tileMap = TileMap.Copy(game.tileMap);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('FRAME_TIME', FRAME_TIME);
        this.lua.global.set('createSprite', (char, color, x, y) => {
            let newSprite = new Sprite(char, color, x, y);
            Matter.Composite.add(this.matterEngine.world, newSprite.body);
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
                Matter.Engine.update(this.matterEngine, FRAME_TIME_MS);
                for (let sprite of this.sprites) {
                    sprite.postPhysicsUpdate(this)
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