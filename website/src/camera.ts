import { Point } from "./util";

export class Camera {
    #currentPos: Point;
    #targetPos: Point;
    #speed: number;
    constructor() {
        this.#currentPos = {x: 0, y: 0};
        this.#targetPos = {x: 0, y: 0};
        this.#speed = 256;
    }
    set x(value) {
        this.#targetPos.x = value;
    }
    set y(value) {
        this.#targetPos.y = value;
    }
    get x() {
        return this.#targetPos.x;
    }
    get y() {
        return this.#targetPos.y;
    }
    frame(deltaTime: number) {
        let dX = this.#targetPos.x - this.#currentPos.x
        let dY = this.#targetPos.y - this.#currentPos.y
        let len = Math.sqrt(dX * dX + dY * dY);
        if (len == 0) return;
        dX /= len;
        dY /= len;
        let maxMove = this.#speed * deltaTime;
        if (len > maxMove) {
            // Move max distance
            this.#currentPos.x += dX * maxMove;
            this.#currentPos.y += dY * maxMove;
        } else {
            // Move to target
            this.#currentPos.x = this.#targetPos.x;
            this.#currentPos.y = this.#targetPos.y;
        }
    }
    getTargetPos(): Point {
        return Object.assign({}, this.#targetPos);
    }
    getViewOffset(): Point {
        let offsetX = -this.#currentPos.x;
        let offsetY = -this.#currentPos.y;
        return {x: offsetX, y: offsetY};
    }
}
