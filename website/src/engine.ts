import {LuaEngine, LuaFactory} from 'wasmoon'
import * as Matter from 'matter-js'
import { PhysicsInput } from './physicsInput'
import { Entity } from './entity'
import { CHAR_WIDTH, DELTA_TIME, DELTA_TIME_MS, PHYSICS_CATEGORY_SPRITE, PHYSICS_CATEGORY_TILE, SCREEN_DIM } from './constants'
import { PatchMap, TileMap } from './tile'
import * as Util from './util'
import { Camera } from './camera'
import { Game } from './game'
import glueUrl from 'wasmoon/dist/glue.wasm';
import PressPlay from './press-play.png';
import { Renderer } from './render'
import { AudioAccessor, AudioEngine, BufferSoundNode, FrequencyInput, OscillatorSoundNode, SoundMod } from './audio'
import { Timer } from './timer'

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

export type LuaExecutor = (f: Function | undefined, ...args: any[]) => void;

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
    timers!: Timer[];
    tileMap!: TileMap;
    camera!: Camera;
    matterEngine!: Matter.Engine;
    physicsInput!: PhysicsInput;
    lua!: LuaEngine;
    luaExecutor: LuaExecutor;
    ranScript: boolean;
    stopScreenData: string[] | undefined;
    luaOnUpdate!: () => void;
    luaOnDrag!: (point: Util.Point) => void;
    luaOnTap!: () => void;
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
        this.luaExecutor = (f: Function | undefined, ...args: any[]) => {
            if (f instanceof Function) {
                try {
                    f(...args);
                } catch(error: any) {
                    const messageCount = this.gameErrors.childElementCount;
                    if (messageCount < 5) {
                        let p = document.createElement("p");
                        p.innerText = `${error}`;
                        this.gameErrors.appendChild(p);
                    }else if (messageCount == 5) {
                        let p = document.createElement("p");
                        p.innerText = "+++Additional Errors Hidden+++";
                        this.gameErrors.appendChild(p);
                    }
                }
            }
        };
        gameCanvas.addEventListener('pointerdown', (event: PointerEvent) => this.pointerEventQueue.push({type: "down", event: event}));
        gameCanvas.addEventListener('pointermove', (event: PointerEvent) => this.pointerEventQueue.push({type: "move", event: event}));
        document.addEventListener('pointerup', (event: PointerEvent) => this.pointerEventQueue.push({type: "up", event: event}));
        document.addEventListener('pointercancel', (event: PointerEvent) => this.pointerEventQueue.push({type: "up", event: event}));
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
        gameCanvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('touchcancel', (event) => event.preventDefault(), { passive: false });
    }
    async play(game: Game) {
        // Setup (should override any existing values)
        this.game = game;
        // Clear game errors
        this.gameErrors.textContent = '';
        this.ranScript = false;
        this.stopScreenData = undefined;
        this.entities = [];
        this.timers = [];
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
        Matter.Events.on(this.matterEngine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                if (pair.bodyA.plugin.entity === undefined || pair.bodyB.plugin.entity === undefined) {
                    return
                }
                const entityA = pair.bodyA.plugin.entity as Entity;
                const entityB = pair.bodyB.plugin.entity as Entity;
                entityA.physics.overlapping.push(entityB);
                entityB.physics.overlapping.push(entityA);
                this.luaExecutor(entityA.physics.onOverlapBegin, entityA, entityB);
                this.luaExecutor(entityB.physics.onOverlapBegin, entityB, entityA);
            }
        });
        Matter.Events.on(this.matterEngine, "collisionEnd", (event) => {
            for (const pair of event.pairs) {
                if (pair.bodyA.plugin.entity === undefined || pair.bodyB.plugin.entity === undefined) {
                    return
                }
                const entityA = pair.bodyA.plugin.entity as Entity;
                const entityB = pair.bodyB.plugin.entity as Entity;
                Util.removeByValue(entityA.physics.overlapping, entityB);
                Util.removeByValue(entityB.physics.overlapping, entityA);
                this.luaExecutor(entityA.physics.onOverlapEnd, entityA, entityB);
                this.luaExecutor(entityB.physics.onOverlapEnd, entityB, entityA);
            }
        });
        Matter.Events.on(this.matterEngine, "collisionActive", (event) => {
            const updateOnFloor = (a: Matter.Body, b: Matter.Body, normal: Matter.Vector) => {
                if (a.plugin.entity === undefined) {
                    return;
                }
                const entityA = (a.plugin.entity as Entity);
                const floorAngle = Math.acos(Matter.Vector.dot({x: 0, y: -1}, normal)) * (180 / Math.PI);
                if (floorAngle < 50.0) {
                    entityA.physics.onFloor = true;
                }
            };
            for (const pair of event.pairs) {
                if (pair.bodyA.isSensor || pair.bodyB.isSensor) {
                    continue;
                }
                updateOnFloor(pair.bodyA, pair.bodyB, pair.collision.normal);
                updateOnFloor(pair.bodyB, pair.bodyA, Matter.Vector.neg(pair.collision.normal));
            }
        });
        // Create bodies
        const options: Matter.IChamferableBodyDefinition = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 1.0,
            isStatic: true,
            collisionFilter: {
                category: PHYSICS_CATEGORY_TILE,
                mask: PHYSICS_CATEGORY_SPRITE,
                group: 0
            }
        };
        for (let x = 0; x < this.tileMap.dim.w; x++) {
            const createBody = (yBegin: number, yEnd: number) => {
                const physBody = Matter.Bodies.rectangle((x + 0.5) * CHAR_WIDTH, (yBegin + yEnd) * 0.5 * CHAR_WIDTH, CHAR_WIDTH, (yEnd - yBegin) * CHAR_WIDTH, options);
                Matter.Composite.add(this.matterEngine.world, physBody);
            };
            let startY: number | null = null;
            for (let y = 0; y < this.tileMap.dim.h; y++) {
                const tile = this.tileMap.getTile({x: x, y: y})!;
                if (game.solidTiles.includes(tile.codePoint)) {
                    if (startY === null) {
                        startY = y;
                    }
                }else{
                    if (startY !== null) {
                        createBody(startY, y);
                        startY = null;
                    }
                }
            }
            if (startY !== null) {
                createBody(startY, this.tileMap.dim.h)
            }
        }
        // Create entity drag constraint
        this.physicsInput = new PhysicsInput(this.matterEngine, this.gameCanvas);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('DELTA_TIME', DELTA_TIME);
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
        this.lua.global.set('createTimer', (duration: number) => {
            let newTimer = new Timer(duration);
            this.timers.push(newTimer)
            return newTimer.wrapped();
        });
        this.lua.global.set('destroyTimer', (timer: Timer) => {
            this.timers = this.timers.filter(s => s !== timer);
        });
        this.lua.global.set('stopGame', (...args: string[]) => {
            this.stopScreenData = args;
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
            this.luaExecutor(() => this.lua.doStringSync(this.game.script));
            // Get Lua References
            this.luaOnUpdate = this.lua.global.get('onUpdate');
            this.luaOnTap = this.lua.global.get('onTap');
            this.luaOnDrag = this.lua.global.get('onDrag');
        }
        // Show stop screen
        if (this.stopScreenData !== undefined) {
            // Rendering
            // Fill Background
            this.renderer.beginFrame();
            this.renderer.viewOffset = {x: 0, y: 0};
            // Draw Strings
            for(let i = 0; i < this.stopScreenData.length; i++) {
                const codePoints = Util.stringToCodePoints(this.stopScreenData[i]);
                this.renderer.drawCharacters(codePoints, new Array(codePoints.length).fill(0), SCREEN_DIM.w / 2, SCREEN_DIM.h / 2 + (i - (this.stopScreenData.length - 1) / 2.0) * CHAR_WIDTH, 0.5, 0.5, 0, true, false);
            }
            this.renderer.endFrame();
            return;
        }
        // Physics
        for (let entity of this.entities) {
            entity.physics.prePhysicsUpdate(this.matterEngine)
        }
        Matter.Engine.update(this.matterEngine, DELTA_TIME_MS);
        for (let entity of this.entities) {
            entity.physics.postPhysicsUpdate(this.matterEngine)
        }
        // Pointer events
        while(this.pointerEventQueue.length > 0) {
            let queued = this.pointerEventQueue.shift()!;
            const pos = Util.getPointerPos(this.gameCanvas, queued.event);
            switch(queued.type) {
                case "down":
                    this.downPointers.set(queued.event.pointerId, pos);
                    this.luaExecutor(this.luaOnDrag, pos);
                    this.luaExecutor(this.luaOnTap);
                    this.physicsInput.onPointerDown(this.matterEngine, queued.event.pointerId, pos);
                    break;
                case "move":
                    if (this.downPointers.has(queued.event.pointerId))
                    {
                        this.downPointers.set(queued.event.pointerId, pos);
                        this.luaExecutor(this.luaOnDrag, pos);
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
                    this.downKeys.add(queued.event.code.toLowerCase());
                    break;
                case "up":
                    this.downKeys.delete(queued.event.code.toLowerCase());
                    break;
            }
        }
        // Update input components
        for (let entity of this.entities) {
            if (!entity.input.enabled) {
                entity.input.down = false;
                continue;
            }
            let newDown = false;
            for (let pointer of this.downPointers) {
                if (entity.input.isPointInside(this.camera, pointer[1])) {
                    newDown = true;
                }
            }
            if (typeof entity.input.key === "string" && this.downKeys.has(entity.input.key.toLowerCase())) {
                newDown = true;
            }
            let oldDown = entity.input.down;
            entity.input.down = newDown;
            if (newDown) {
                if (!oldDown) {
                    this.luaExecutor(entity.input.onPress, entity);
                }
            }
            else if (oldDown) {
                this.luaExecutor(entity.input.onRelease, entity);
            }
        }
        // Frame
        this.luaExecutor(this.luaOnUpdate);
        for (let entity of this.entities) {
            this.luaExecutor(entity.onUpdate, entity);
        }
        for (let timer of this.timers) {
            timer.update(DELTA_TIME, this.luaExecutor);
        }
        this.timers = this.timers.filter(t => !t.finished);
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