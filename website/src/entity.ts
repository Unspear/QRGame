import * as Matter from 'matter-js'
import { Point, stringToCodePoints } from './util';
import { Renderer } from './render';
import { INPUT_PHYSICS_GROUP, NORMAL_PHYSICS_GROUP } from './constants';

type EntityFunction = (self: Entity) => void

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
    simulate: boolean;
    bounce: boolean;
    drag: boolean;
    onFloor: boolean;
    #physState: null | {
        body: Matter.Body,
        dim: Point,
        bounce: boolean,
        simulate: boolean,
        parentPos: Point,
    };
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.vel = {x: 0, y: 0};
        this.simulate = false;
        this.bounce = false;
        this.drag = false;
        this.onFloor = false;
        this.#physState = null;
    }
    copyFrom(physics: PhysicsComponent) {
        super.copyFrom(physics);
        this.vel = physics.vel;
        this.simulate = physics.simulate;
        this.bounce = physics.bounce;
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
        // Body simulate doesn't match
        if (this.#physState.simulate !== this.simulate) {
            return true;
        }
        // Body bounce doesn't match
        if (this.#physState.bounce !== this.bounce) {
            return true;
        }
        // All is fine
        return false;
    }
    prePhysicsUpdate(matterEngine: Matter.Engine) {
        // Remove body if wanted or width/height is wrong
        if (this.#physState !== null && this.#shouldRemoveBody()) {
            // Destroy body
            Matter.Composite.remove(matterEngine.world, this.#physState.body);
            this.#physState = null;
        }
        // Check if the body needs to be created
        if (this.enabled && this.#physState === null) {
            // Create Body
            const options: Matter.IChamferableBodyDefinition = {
                inertia: Infinity,// Prevent rotation
                restitution: this.bounce ? 1.0 : 0.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: false,
                isStatic: !this.simulate,
                plugin: { entity: this.parent },
                collisionFilter: {
                    category: 1,
                    mask: 0,
                    group: NORMAL_PHYSICS_GROUP,
                }
            }
            let bodyPos = this.gpos;
            this.#physState = {
                body: Matter.Bodies.rectangle(bodyPos.x, bodyPos.y, this.dim.x, this.dim.y, options),
                dim: { ...this.dim },
                bounce: this.bounce,
                simulate: this.simulate,
                parentPos: {...this.parent.pos},
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
        } else {
            this.vel = {x: 0, y: 0};
        }
    }
}

export class InputComponent extends BoxComponent {
    press: EntityFunction | undefined;
    release: EntityFunction | undefined;
    key: string;
    down: boolean;
    #physState: null | {
        body: Matter.Body,
        dim: Point,
    };
    constructor(parent: Entity, enabled: boolean) {
        super(parent, enabled)
        this.key = "";
        this.down = false;
        this.#physState = null;
    }
    copyFrom(input: InputComponent) {
        super.copyFrom(input);
        this.press = input.press;
        this.release = input.release;
        this.key = input.key;
        // this.down is not copied because I consider it transient
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
        // All is fine
        return false;
    }
    prePhysicsUpdate(matterEngine: Matter.Engine) {
        // Remove body if wanted or width/height is wrong
        if (this.#physState !== null && this.#shouldRemoveBody()) {
            // Destroy body
            Matter.Composite.remove(matterEngine.world, this.#physState.body);
            this.#physState = null;
        }
        // Check if the body needs to be created
        if (this.enabled && this.#physState === null) {
            // Create Body
            const options: Matter.IChamferableBodyDefinition = {
                inertia: Infinity,// Prevent rotation
                restitution: 0.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: false,
                isStatic: true,
                plugin: { entity: this.parent },
                collisionFilter: {
                    category: 1,
                    mask: 0,
                    group: INPUT_PHYSICS_GROUP,
                },
            }
            let bodyPos = this.gpos;
            this.#physState = {
                body: Matter.Bodies.rectangle(bodyPos.x, bodyPos.y, this.dim.x, this.dim.y, options),
                dim: { ...this.dim },
            }
            Matter.Composite.add(matterEngine.world, this.#physState.body);
        }
        if (this.#physState) {
            Matter.Body.setPosition(this.#physState.body, this.gpos);
        }
    }
    postPhysicsUpdate(matterEngine: Matter.Engine) {
    }
}

export class Entity {
    pos: Point;
    frame: EntityFunction | undefined;
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
        s.frame = entity.frame;
        s.sprite.copyFrom(entity.sprite);
        s.physics.copyFrom(entity.physics);
        s.input.copyFrom(entity.input);
        return s;
    }
    get screen(): boolean {
        return this.#screen;
    }
}