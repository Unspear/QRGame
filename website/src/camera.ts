import { Point } from "./util";

export class Camera {
    #pos: Point;
    constructor() {
        this.#pos = {x: 0, y: 0};
    }
    set x(value) {
        this.#pos.x = value;
    }
    set y(value) {
        this.#pos.y = value;
    }
    get x() {
        return this.#pos.x;
    }
    get y() {
        return this.#pos.y;
    }
    getPos(): Point {
        return Object.assign({}, this.#pos);
    }
    getViewOffset(): Point {
        let offsetX = -this.#pos.x;
        let offsetY = -this.#pos.y;
        return {x: offsetX, y: offsetY};
    }
}
