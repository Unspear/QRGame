import { Point } from "./util";

export class Camera {
    #currentPos: Point;
    #targetPos: Point;
    constructor() {
        this.#currentPos = {x: 0, y: 0};
        this.#targetPos = {x: 0, y: 0};
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
        this.#currentPos.x = this.#targetPos.x;
        this.#currentPos.y = this.#targetPos.y;
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
