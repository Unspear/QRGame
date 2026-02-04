import charRenderer from './render.js'
import { CHAR_WIDTH, PALETTE } from './constants';
import Matter from 'matter-js'

export class Sprite {
    #x;
    #y;
    #px;
    #py;
    #physBody;
    #physHasBody;
    #physIsStatic;
    #physIsSensor;
    #physIsDrag;
    #physVelX;
    #physVelY;
    constructor(char, color, x, y) {
        this.char = char;
        this.color = color;
        this.#x = x;
        this.#y = y;
        this.#px = 0.5;
        this.#py = 0.5;
        this.wrap = 0;
        this.compact = true;
        this.#physBody = null;
        this.#physHasBody = false;
        this.#physIsStatic = false;
        this.#physIsSensor = false;
        this.#physIsDrag = false;
        this.#physVelX = null;
        this.#physVelY = null;
    }
    #getBodyX() {
        return this.#x - CHAR_WIDTH * this.#px + CHAR_WIDTH * 0.5;
    }
    #getBodyY() {
        return this.#y - CHAR_WIDTH * this.#py + CHAR_WIDTH * 0.5;
    }
    #getEntityXFromBody() {
        return this.#physBody.position.x + CHAR_WIDTH * this.#px - CHAR_WIDTH * 0.5;
    }
    #getEntityYFromBody() {
        return this.#physBody.position.y + CHAR_WIDTH * this.#py - CHAR_WIDTH * 0.5;
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
    // Physics
    set physics(value) {
        this.#physHasBody = value;
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
        if (this.#physHasBody === true) {
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
        if (this.#physHasBody === true) {
            if (this.#physVelY !== null) {
                return this.#physVelY;
            }
            if (this.#physBody !== null) {
                return this.#physBody.velocity.y
            }
        }
        return 0;
    }
    prePhysicsUpdate(matterEngine) {
        // Check if the body needs to be created or destroyed
        if (this.#physHasBody && this.#physBody === null) {
            // Create Body
            const options = {
                inertia: Infinity,// Prevent rotation
                restitution: 1.0,
                frictionAir: 0.0,
                friction: 1.0,
                isSensor: this.#physIsSensor,
                isStatic: this.#physIsStatic,
                plugin: { drag: this.#physIsDrag }
            }
            this.#physBody = Matter.Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), CHAR_WIDTH, CHAR_WIDTH, options);
            Matter.Composite.add(matterEngine.world, this.#physBody);
            if (this.#physVelX !== null || this.#physVelY !== null) {
                if (this.#physVelX === null) {
                    this.#physVelX = this.#physBody.velocity.x;
                }
                if (this.#physVelY === null) {
                    this.#physVelY = this.#physBody.velocity.y;
                }
                const newVel = { x: this.#physVelX, y: this.#physVelY };
                Matter.Body.setVelocity(this.#physBody, newVel);
                console.log(newVel);
            }
        }
        else if (!this.#physHasBody && this.#physBody !== null) {
            // Destory body
            Matter.Composite.remove(matterEngine.world, this.#physBody);
            this.#physBody = null;
        }
        this.#physVelX = null;
        this.#physVelY = null;
    }
    postPhysicsUpdate(matterEngine) {
        if (this.#physBody) {
            this.#x = this.#getEntityXFromBody();
            this.#y = this.#getEntityYFromBody();
        }
    }
    draw(context) {
        const codePoints = [...this.char].map(c => c.codePointAt(0));
        charRenderer.draw(context, codePoints, new Array(codePoints.length).fill(this.color), this.#x, this.#y, this.#px, this.#py, this.wrap, this.compact)
    }
}