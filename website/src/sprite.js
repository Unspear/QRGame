import charRenderer from './render.js'
import { CHAR_WIDTH, PALETTE } from './constants';
import Matter from 'matter-js'

export class Sprite {
    #x;
    #y;
    #px;
    #py;
    #drag;
    constructor(char, color, x, y) {
        this.char = char;
        this.color = color;
        this.#x = x;
        this.#y = y;
        this.#px = 0.0;
        this.#py = 0.0;
        this.wrap = 0;
        this.compact = true;
        this.body = Matter.Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), CHAR_WIDTH, CHAR_WIDTH);
        this.body.isSensor = true;
        this.drag = false;
    }
    #getBodyX() {
        return this.#x - CHAR_WIDTH * this.#px + CHAR_WIDTH * 0.5;
    }
    #getBodyY() {
        return this.#y - CHAR_WIDTH * this.#py + CHAR_WIDTH * 0.5;
    }
    #getSpriteX() {
        return this.#x - CHAR_WIDTH * this.#px;
    }
    #getSpriteY() {
        return this.#y - CHAR_WIDTH * this.#py;
    }
    #getEntityXFromBody() {
        return this.body.position.x + CHAR_WIDTH * this.#px - CHAR_WIDTH * 0.5;
    }
    #getEntityYFromBody() {
        return this.body.position.y + CHAR_WIDTH * this.#py - CHAR_WIDTH * 0.5;
    }
    set x(value) {
        this.#x = value;
        Matter.Body.setPosition(this.body, {x: this.#getBodyX(), y: this.#getBodyY()});
        //Matter.Body.setVelocity(this.body, {x: 0, y: 0})
    }
    get x() {
        return this.#x;
    }
    set y(value) {
        this.#y = value;
        Matter.Body.setPosition(this.body, {x: this.#getBodyX(), y: this.#getBodyY()});
        //Matter.Body.setVelocity(this.body, {x: 0, y: 0})
    }
    get y() {
        return this.#y;
    }
    set drag(value) {
        this.#drag = value;
        this.body.plugin.drag = value;
    }
    get drag() {
        return this.#drag;
    }
    postPhysicsUpdate() {
        this.#x = this.#getEntityXFromBody();
        this.#y = this.#getEntityYFromBody();
    }
    draw(context) {
        charRenderer.draw(context, Array.from(this.char), this.#getSpriteX(), this.#getSpriteY(), PALETTE[this.color], this.wrap, this.compact)
    }
}