import charRenderer from './oldRender'
import { CHAR_WIDTH, PALETTE } from './constants';
import * as Matter from 'matter-js'
import { Point } from './util';

export class Sprite {
    char: string;
    color: number;
    wrap: number;
    compact: boolean;
    #x: number;
    #y: number;
    #px: number;
    #py: number;
    #physBody: Matter.Body | null;
    #physWidth: number;
    #physHeight : number;
    #physIsStatic: boolean;
    #physIsSensor: boolean;
    #physIsDrag: boolean;
    #physVelX: number | null;
    #physVelY: number | null;
    #physWantsBody: boolean;
    #physWantsWidth: number;
    #physWantsHeight: number;
    constructor(char: string, color: number, x: number, y: number) {
        this.char = char;
        this.color = color;
        this.#x = x;
        this.#y = y;
        this.#px = 0.5;
        this.#py = 0.5;
        this.wrap = 0;
        this.compact = true;
        this.#physBody = null;
        this.#physWidth = CHAR_WIDTH;
        this.#physHeight = CHAR_WIDTH;
        this.#physIsStatic = false;
        this.#physIsSensor = false;
        this.#physIsDrag = false;
        this.#physVelX = null;
        this.#physVelY = null;
        this.#physWantsBody = false;
        this.#physWantsWidth = CHAR_WIDTH;
        this.#physWantsHeight = CHAR_WIDTH;
    }
    static Copy(sprite: Sprite) {
        let s = new Sprite(sprite.char, sprite.color, sprite.x, sprite.y);
        s.px = sprite.px;
        s.py = sprite.py;
        s.wrap = sprite.wrap;
        s.compact = sprite.compact;
        s.physics = sprite.physics;
        s.static = sprite.static;
        s.sensor = sprite.sensor;
        s.drag = sprite.drag;
        s.width = sprite.width;
        s.height = sprite.height;
        // not doing velocity for now
        return s;
    }
    #getBodyX() {
        return this.#x - CHAR_WIDTH * this.#px + CHAR_WIDTH * 0.5;
    }
    #getBodyY() {
        return this.#y - CHAR_WIDTH * this.#py + CHAR_WIDTH * 0.5;
    }
    set x(value) {
        this.#x = value;
        if (this.#physBody) {
            Matter.Body.setPosition(this.#physBody, {x: this.#getBodyX(), y: this.#getBodyY()});
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get x() {
        return this.#x;
    }
    set y(value) {
        this.#y = value;
        if (this.#physBody) {
            Matter.Body.setPosition(this.#physBody, {x: this.#getBodyX(), y: this.#getBodyY()});
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get y() {
        return this.#y;
    }
    // Set Pivot
    set px(value) {
        this.#px = value;
    }
    get px() {
        return this.#px;
    }
    set py(value) {
        this.#py = value;
    }
    get py() {
        return this.#py;
    }
    // Physics
    set physics(value) {
        this.#physWantsBody = value;
    }
    get physics() {
        return this.#physWantsBody;
    }
    set static(value) {
        this.#physIsStatic = value
        if (this.#physBody) {
            this.#physBody.isStatic = value;
        }
    }
    get static() {
        return this.#physIsStatic;
    }
    set sensor(value) {
        this.#physIsSensor = value
        if (this.#physBody) {
            this.#physBody.isSensor = value;
        }
    }
    get sensor() {
        return this.#physIsSensor;
    }
    set drag(value) {
        this.#physIsDrag = value;
        if (this.#physBody) {
            this.#physBody.plugin.drag = value;
        }
    }
    get drag() {
        return this.#physIsDrag;
    }
    set velX(value) {
        this.#physVelX = value;
    }
    get velX() {
        if (this.#physWantsBody === true) {
            if (this.#physVelX !== null) {
                return this.#physVelX;
            }
            if (this.#physBody !== null) {
                return this.#physBody.velocity.x
            }
        }
        return 0;
    }
    set velY(value) {
        this.#physVelY = value;
    }
    get velY() {
        if (this.#physWantsBody === true) {
            if (this.#physVelY !== null) {
                return this.#physVelY;
            }
            if (this.#physBody !== null) {
                return this.#physBody.velocity.y
            }
        }
        return 0;
    }
    set width(value) {
        this.#physWantsWidth = value;
    }
    get width() {
        return this.#physWantsWidth;
    }
    set height(value) {
        this.#physWantsHeight = value;
    }
    get height() {
        return this.#physWantsHeight;
    }
    prePhysicsUpdate(matterEngine: Matter.Engine) {
        // Remove body if wanted or width/height is wrong
        if (this.#physBody !== null && (!this.#physWantsBody || this.#physWantsWidth !== this.#physWidth || this.#physWantsHeight !== this.#physHeight)) {
            // Destroy body
            Matter.Composite.remove(matterEngine.world, this.#physBody);
            this.#physBody = null;
        }
        // Check if the body needs to be created
        if (this.#physWantsBody && this.#physBody === null) {
            // Create Body
            const options = {
                inertia: Infinity,// Prevent rotation
                restitution: 1.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: this.#physIsSensor,
                isStatic: this.#physIsStatic,
                plugin: { drag: this.#physIsDrag }
            }
            this.#physBody = Matter.Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), this.#physWantsWidth, this.#physWantsHeight, options);
            this.#physWidth = this.#physWantsWidth;
            this.#physHeight = this.#physWantsHeight;
            Matter.Composite.add(matterEngine.world, this.#physBody);
        }
        if (this.#physBody) {
            if (this.#physVelX !== null || this.#physVelY !== null) {
                if (this.#physVelX === null) {
                    this.#physVelX = this.#physBody.velocity.x;
                }
                if (this.#physVelY === null) {
                    this.#physVelY = this.#physBody.velocity.y;
                }
                const newVel = { x: this.#physVelX, y: this.#physVelY };
                Matter.Body.setVelocity(this.#physBody, newVel);
            }
        }
        this.#physVelX = null;
        this.#physVelY = null;
    }
    postPhysicsUpdate(matterEngine: Matter.Engine) {
        if (this.#physBody) {
            this.#x = this.#physBody.position.x + CHAR_WIDTH * this.#px - CHAR_WIDTH * 0.5;
            this.#y = this.#physBody.position.y + CHAR_WIDTH * this.#py - CHAR_WIDTH * 0.5;
        }
    }
    draw(context: CanvasRenderingContext2D, viewOffset: Point) {
        const codePoints = [...this.char].map(c => c.codePointAt(0) ?? 0);
        charRenderer.draw(context, codePoints, new Array(codePoints.length).fill(this.color), this.#x + viewOffset.x, this.#y + viewOffset.y, this.#px, this.#py, this.wrap, this.compact)
    }
}