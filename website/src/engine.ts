import {LuaEngine, LuaFactory} from 'wasmoon'
import * as Matter from 'matter-js'
import { PhysicsInput } from './physicsInput'
import { Entity } from './entity'
import { CHAR_WIDTH, FRAME_TIME, FRAME_TIME_MS, NORMAL_PHYSICS_GROUP, SCREEN_DIM } from './constants'
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import { Camera } from './camera'
import { Game } from './game'
import glueUrl from 'wasmoon/dist/glue.wasm';
import PressPlay from './press-play.png';
import { Renderer } from './render'
import { AudioAccessor, AudioEngine, BufferSoundNode, FrequencyInput, OscillatorSoundNode, SoundMod } from './audio'

let pressPlayImage = new Image();
pressPlayImage.src = PressPlay;

type QueuedPointerEvent = {
    type: "down" | "move" | "up",
    event: PointerEvent
}
type QueuedKeyboardEvent = {
    type: "down" | "up",
    event: KeyboardEvent
}

export class Engine {
    gameCanvas: HTMLCanvasElement;
    gameErrors: HTMLDivElement;
    luaFactory: LuaFactory;
    downPointers: Map<number, Util.Point>;
    downKeys: Set<string>;
    renderer: Renderer;
    audio: AudioEngine;
    #paused: boolean;
    pointerEventQueue: QueuedPointerEvent[];
    keyboardEventQueue: QueuedKeyboardEvent[];
    game!: Game;
    entities!: Entity[];
    tileMap!: TileMap;
    camera!: Camera;
    matterEngine!: Matter.Engine;
    physicsInput!: PhysicsInput;
    lua!: LuaEngine;
    ranScript: boolean;
    endScreenString: string | undefined;
    luaFrame!: () => void;
    luaDrag!: (point: Util.Point) => void;
    luaTap!: () => void;
    constructor(gameCanvas: HTMLCanvasElement, gameErrors: HTMLDivElement) {
        this.pointerEventQueue = [];
        this.keyboardEventQueue = [];
        this.#paused = false;
        this.gameCanvas = gameCanvas;
        this.gameErrors = gameErrors;
        this.audio = new AudioEngine();
        this.luaFactory = new LuaFactory(glueUrl);
        this.renderer = new Renderer(this.gameCanvas);
        this.downPointers = new Map();
        this.downKeys = new Set();
        this.ranScript = false;
        gameCanvas.addEventListener('pointerdown', (event: PointerEvent) => this.pointerEventQueue.push({type: "down", event: event}));
        gameCanvas.addEventListener('pointermove', (event: PointerEvent) => this.pointerEventQueue.push({type: "move", event: event}));
        document.addEventListener('pointerup', (event: PointerEvent) => this.pointerEventQueue.push({type: "up", event: event}));
        const capturedCodes = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (gameCanvas.checkVisibility()) {
                this.keyboardEventQueue.push({type: "down", event: event});
                if (capturedCodes.indexOf(event.code) > -1) {
                    event.preventDefault();
                }
            }
        }, { passive: false });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            if (gameCanvas.checkVisibility()) {
                this.keyboardEventQueue.push({type: "up", event: event});
                if (capturedCodes.indexOf(event.code) > -1) {
                    event.preventDefault();
                }
            }
        }, { passive: false });
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
        this.endScreenString = undefined;
        this.entities = [];
        const gameTileMap = TileMap.Copy(game.tileMap);
        const gamePatchMap = PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new Camera();
        this.camera.setLevelDim(this.tileMap.getDrawDim());
        if (this.audio) {
            this.audio.close();
        }
        this.audio = new AudioEngine();
        // Create physics engine
        (Matter.Resolver as any)._restingThresh = 1;
        this.matterEngine = Matter.Engine.create({ 
            gravity: { scale: 0 }
        });
        Matter.Events.on(this.matterEngine, "collisionActive", (event) => {
            const updateFloorForPair = (a: Matter.Body, b: Matter.Body, normal: Matter.Vector) => {
                if (a.plugin.entity === undefined) {
                    return;
                }
                const entity = (a.plugin.entity as Entity);
                const floorAngle = Math.acos(Matter.Vector.dot({x: 0, y: -1}, normal)) * (180 / Math.PI);
                if (floorAngle < 50.0) {
                    entity.physics.onFloor = true;
                }
            };
            for (const pair of event.pairs) {
                updateFloorForPair(pair.bodyA, pair.bodyB, pair.collision.normal);
                updateFloorForPair(pair.bodyB, pair.bodyA, Matter.Vector.neg(pair.collision.normal));
            }
        });
        // Create bodies
        const options: Matter.IChamferableBodyDefinition = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 0.0,
            isStatic: true,
            collisionFilter: {
                mask: 0,
                category: 0,
                group: NORMAL_PHYSICS_GROUP
            }
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
        // Create entity drag constraint
        this.physicsInput = new PhysicsInput(this.matterEngine, this.gameCanvas);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('FRAME_TIME', FRAME_TIME);
        this.lua.global.set('createEntity', (char: string, color: number, x: number, y: number) => {
            let newEntity = new Entity({ x: x, y: y}, false);
            newEntity.sprite.char = char;
            newEntity.sprite.color = color;
            this.entities.push(newEntity);
            return newEntity;
        });
        this.lua.global.set('createScreenEntity', (char: string, color: number, x: number, y: number) => {
            let newEntity = new Entity({ x: x, y: y}, true);
            newEntity.sprite.char = char;
            newEntity.sprite.color = color;
            this.entities.push(newEntity);
            return newEntity;
        });
        this.lua.global.set('destroyEntity', (entity: Entity) => {
            this.entities = this.entities.filter(s => s !== entity);
        });
        this.lua.global.set('copyEntity', (entity: Entity) => {
            let newEntity = Entity.Copy(entity);
            this.entities.push(newEntity);
            return newEntity;
        });
        this.lua.global.set('endGame', (string: string) => {
            this.endScreenString = string;
        });
        this.lua.global.set('getMarkers', (markerId: string) => {
            const id = markerId.codePointAt(0);
            let result: Util.Point[] = []
            for (const m of this.game.markers) {
                if (m.codePoint === id) {
                    result.push({x: (m.x + 0.5) * CHAR_WIDTH, y: (m.y + 0.5) * CHAR_WIDTH});
                }
            }
            return result;
        })
        // Simple Audio functions
        this.lua.global.set('audio', new AudioAccessor(this.audio));
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
        // Show end screen
        if (this.endScreenString !== undefined) {
            // Rendering
            // Fill Background
            this.renderer.beginFrame();
            this.renderer.viewOffset = {x: 0, y: 0};
            // Draw Tilemap
            const codePoints = Util.stringToCodePoints(this.endScreenString);
            this.renderer.drawCharacters(codePoints, new Array(codePoints.length).fill(0), SCREEN_DIM.w / 2, SCREEN_DIM.h / 2, 0.5, 0.5, 0, true, false);
            this.renderer.endFrame();
            return;
        }
        // Physics
        for (let entity of this.entities) {
            entity.physics.prePhysicsUpdate(this.matterEngine)
            entity.input.prePhysicsUpdate(this.matterEngine)
        }
        Matter.Engine.update(this.matterEngine, FRAME_TIME_MS);
        for (let entity of this.entities) {
            entity.physics.postPhysicsUpdate(this.matterEngine)
            entity.input.postPhysicsUpdate(this.matterEngine)
        }
        // Frame
        if (this.luaFrame)
        {
            this.luaFrame();
        }
        for (let entity of this.entities) {
            if (entity.frame instanceof Function) {
                entity.frame();
            }
        }
        this.physicsInput.onUpdate(this.matterEngine, this.downPointers, this.entities, this.downKeys);
        // Pointer events
        while(this.pointerEventQueue.length > 0) {
            let queued = this.pointerEventQueue.shift()!;
            const pos = Util.getPointerPos(this.gameCanvas, queued.event);
            switch(queued.type) {
                case "down":
                    this.downPointers.set(queued.event.pointerId, pos);
                    if (this.luaDrag)
                    {
                        this.luaDrag(pos);
                    }
                    if (this.luaTap)
                    {
                        this.luaTap();
                    }
                    this.physicsInput.onPointerDown(this.matterEngine, queued.event.pointerId, pos);
                    break;
                case "move":
                    
                    if (this.downPointers.has(queued.event.pointerId))
                    {
                        this.downPointers.set(queued.event.pointerId, pos);
                        if (this.luaDrag)
                        {
                            this.luaDrag(pos);
                        }
                    }
                    this.physicsInput.onPointerMove(queued.event.pointerId, pos);
                    break;
                case "up":
                    this.downPointers.delete(queued.event.pointerId);
                    this.physicsInput.onPointerUp(queued.event.pointerId, pos);
                    break;
            }
        }
        while(this.keyboardEventQueue.length > 0) {
            let queued = this.keyboardEventQueue.shift()!;
            switch(queued.type) {
                case "down":
                    if (!this.downKeys.has(queued.event.code)) {
                        this.downKeys.add(queued.event.code);
                        this.physicsInput.onKeyDown(this.entities, queued.event.code);
                    }
                    break;
                case "up":
                    this.downKeys.delete(queued.event.code);
                    this.physicsInput.onKeyUp(this.entities, queued.event.code);
                    break;
            }
        }
        // Rendering
        // Fill Background
        this.renderer.beginFrame();
        this.renderer.viewOffset = this.camera.getViewOffset();
        // Draw Tilemap
        this.tileMap.draw(this.renderer);
        // Draw entities
        for (let entity of this.entities) {
            entity.sprite.draw(this.renderer)
        }
        this.renderer.endFrame();
    }
}