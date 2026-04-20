import * as Matter from 'matter-js'
import { Point, stringToCodePoints } from './util';
import { Renderer } from './render';
import { PHYSICS_CATEGORY_SENSOR, PHYSICS_CATEGORY_SPRITE, PHYSICS_CATEGORY_TILE } from './constants';
import { Camera } from './camera';

type EntityFunction = (self: Entity) => void
type EntityOverlapFunction = (self: Entity, other: Entity) => void

export class EntityComponent {
    parent: Entity;
    lpos: Point;
    pivot: Point;
    enabled: boolean;
    constructor(parent: Entity, enabled: boolean) {
        this.parent = parent;
        this.lpos = {x: 0, y: 0};
        this.pivot = {x: 0, y: 0};
        this.enabled = enabled;
    }
    copyFrom(component: EntityComponent) {
        this.lpos = {...component.lpos};
        this.pivot = {...component.pivot};
        this.enabled = component.enabled;
    }
}

export class BoxComponent extends EntityComponent {
    dim: Point;
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.dim = {x: 16, y: 16};
    }
    copyFrom(box: BoxComponent) {
        super.copyFrom(box);
        this.dim = {...box.dim};
    }
    get gpos() {
        return {
            x: this.parent.pos.x + this.lpos.x - this.dim.x * 0.5 * this.pivot.x,
            y: this.parent.pos.y + this.lpos.y - this.dim.y * 0.5 * this.pivot.y,
        }
    }
    isPointInside(camera: Camera, screenPoint: Point): boolean {
        let point = {x: screenPoint.x, y: screenPoint.y };
        if (!this.parent.screen) {
            point.x += camera.pos.x;
            point.y += camera.pos.y;
        }
        const centre = this.gpos;
        const left = centre.x - this.dim.x * 0.5;
        const right = centre.x + this.dim.x * 0.5;
        const top = centre.y - this.dim.y * 0.5;
        const bottom = centre.y + this.dim.y * 0.5;
        return left < point.x && point.x < right && top < point.y && point.y < bottom; 
    }
}

export class SpriteComponent extends EntityComponent {
    char: string;
    color: number;
    wrap: number;
    compact: boolean;
    fliph: boolean;
    flipv: boolean;
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.char = "";
        this.color = 0;
        this.wrap = 0;
        this.compact = true;
        this.fliph = false;
        this.flipv = false;
    }
    get gpos() {
        return {
            x: this.parent.pos.x + this.lpos.x,
            y: this.parent.pos.y + this.lpos.y,
        }
    }
    copyFrom(sprite: SpriteComponent) {
        super.copyFrom(sprite);
        this.char = sprite.char;
        this.color = sprite.color;
        this.wrap = sprite.wrap;
        this.compact = sprite.compact;
        this.fliph = sprite.fliph;
        this.flipv = sprite.flipv;
    }
    draw(renderer: Renderer) {
        const codePoints = stringToCodePoints(this.char);
        const globalPos = this.gpos;
        renderer.drawCharacters(codePoints, new Array(codePoints.length).fill(this.color), globalPos.x, globalPos.y, this.pivot.x*0.5+0.5, this.pivot.y*0.5+0.5, this.wrap, this.compact, this.parent.screen, this.fliph, this.flipv);
    }
}

export class PhysicsComponent extends BoxComponent {
    vel: Point;
    static: boolean;
    sensor: boolean;
    ghost: boolean;
    bounce: number;
    friction: number;
    drag: boolean;
    onFloor: boolean;
    overlapping: Entity[];
    onOverlapBegin: EntityOverlapFunction | undefined;
    onOverlapEnd: EntityOverlapFunction | undefined;
    #physState: null | {
        body: Matter.Body,
        ghostSensor?: Matter.Body;
        dim: Point,
        parentPos: Point,
    };
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.vel = {x: 0, y: 0};
        this.static = false;
        this.sensor = false;
        this.ghost = false;
        this.bounce = 0.0;
        this.friction = 0.0;
        this.drag = false;
        this.onFloor = false;
        this.overlapping = [];
        this.#physState = null;
    }
    copyFrom(physics: PhysicsComponent) {
        super.copyFrom(physics);
        this.vel = physics.vel;
        this.static = physics.static;
        this.sensor = physics.sensor;
        this.bounce = physics.bounce;
        this.friction = physics.friction;
        this.drag = physics.drag;
    }
    #shouldRemoveBody(): boolean {
        // Body doesn't exist
        if (this.#physState === null) {
            return false;
        }
        // Body should not exist
        if (!this.enabled) {
            return true;
        }
        // Body width doesn't match
        if (this.#physState.dim.x !== this.dim.x) {
            return true;
        }
        // Body height doesn't match
        if (this.#physState.dim.y !== this.dim.y) {
            return true;
        }
        // Body having extra sensor doesn't match ghost
        if ((this.#physState.ghostSensor !== undefined) !== this.ghost) {
            return true;
        }
        // All is fine
        return false;
    }
    prePhysicsUpdate(matterEngine: Matter.Engine) {
        // Remove body if wanted or width/height is wrong
        if (this.#physState !== null) {
            if (this.#shouldRemoveBody()) {
                // Destroy body
                Matter.Composite.remove(matterEngine.world, this.#physState.body);
                if (this.#physState.ghostSensor) {
                    Matter.Composite.remove(matterEngine.world, this.#physState.ghostSensor);
                }
                this.#physState = null;
            }
            else {
                if (this.#physState.body.isStatic !== this.static) {
                    Matter.Body.setStatic(this.#physState.body, this.static);
                }
                this.#physState.body.isSensor = this.sensor;
                this.#physState.body.restitution = this.bounce;
                this.#physState.body.friction = this.friction;
            }
        }
        // Check if the body needs to be created
        if (this.enabled && this.#physState === null) {
            // Create Body
            const options: Matter.IChamferableBodyDefinition = {
                inertia: Infinity,// Prevent rotation
                restitution: this.bounce,
                frictionAir: 0.0,
                friction: this.friction,
                isSensor: this.sensor,
                isStatic: this.static,
                plugin: { entity: this.parent },
                collisionFilter: {
                    category: PHYSICS_CATEGORY_SPRITE,
                    mask: PHYSICS_CATEGORY_TILE | PHYSICS_CATEGORY_SENSOR | (this.ghost ? 0 : PHYSICS_CATEGORY_SPRITE),
                    group: 0,
                }
            }
            let bodyPos = this.gpos;
            this.#physState = {
                body: Matter.Bodies.rectangle(bodyPos.x, bodyPos.y, this.dim.x, this.dim.y, options),
                dim: { ...this.dim },
                parentPos: {...this.parent.pos},
            }
            if (this.ghost) {
                const sensorOptions: Matter.IChamferableBodyDefinition = {
                    isSensor: true,
                    plugin: { entity: this.parent },
                    collisionFilter: {
                        category: PHYSICS_CATEGORY_SENSOR,
                        mask: PHYSICS_CATEGORY_SPRITE,
                        group: 0,
                    }
                }
                this.#physState.ghostSensor = Matter.Bodies.rectangle(bodyPos.x, bodyPos.y, this.dim.x, this.dim.y, sensorOptions);
                Matter.Composite.add(matterEngine.world, this.#physState.ghostSensor);
            }
            Matter.Composite.add(matterEngine.world, this.#physState.body);
        }
        if (this.#physState) {
            const matterVel = Matter.Body.getVelocity(this.#physState.body);
            if (matterVel.x !== this.vel.x || matterVel.y !== this.vel.y) {
                Matter.Body.setVelocity(this.#physState.body, this.vel);
            }
            if (this.parent.pos.x !== this.#physState.parentPos.x || this.parent.pos.y !== this.#physState.parentPos.y) {
                Matter.Body.setPosition(this.#physState.body, this.gpos);
            } 
        }
        this.onFloor = false;
    }
    postPhysicsUpdate(matterEngine: Matter.Engine) {
        if (this.#physState) {
            this.vel = Matter.Body.getVelocity(this.#physState.body);
            const oldGlobalPos = this.gpos;
            const newGlobalPos = this.#physState.body.position;
            this.parent.pos.x += newGlobalPos.x - oldGlobalPos.x;
            this.parent.pos.y += newGlobalPos.y - oldGlobalPos.y;
            this.#physState.parentPos = {...this.parent.pos};
            if (this.#physState.ghostSensor) {
                Matter.Body.setPosition(this.#physState.ghostSensor, this.#physState.body.position);
                Matter.Body.setAngle(this.#physState.ghostSensor, this.#physState.body.angle);
            }
        } else {
            this.vel = {x: 0, y: 0};
        }
    }
}

export class InputComponent extends BoxComponent {
    onPress: EntityFunction | undefined;
    onRelease: EntityFunction | undefined;
    key: string;
    down: boolean;
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.key = "";
        this.down = false;
    }
    copyFrom(input: InputComponent) {
        super.copyFrom(input);
        this.onPress = input.onPress;
        this.onRelease = input.onRelease;
        this.key = input.key;
        // this.down is not copied because I consider it transient
    }
}

export class Entity {
    pos: Point;
    onUpdate: EntityFunction | undefined;
    sprite: SpriteComponent;
    physics: PhysicsComponent;
    input: InputComponent;
    #screen: boolean;
    constructor(pos: Point, screen: boolean) {
        this.pos = {...pos};
        this.#screen = screen;
        this.sprite = new SpriteComponent(this, true);
        this.physics = new PhysicsComponent(this, false);
        this.input = new InputComponent(this, false);
    }
    static Copy(entity: Entity) {
        let s = new Entity(entity.pos, entity.#screen);
        s.onUpdate = entity.onUpdate;
        s.sprite.copyFrom(entity.sprite);
        s.physics.copyFrom(entity.physics);
        s.input.copyFrom(entity.input);
        return s;
    }
    get screen(): boolean {
        return this.#screen;
    }
}