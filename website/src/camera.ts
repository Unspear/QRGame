import { SCREEN_DIM } from "./constants";
import { Dimensions, Point, clamp } from "./util";

export class Camera {
    #pos: Point;
    #levelDim: Dimensions | undefined;
    constructor() {
        this.#pos = {x: 0, y: 0};
    }
    set x(value) {
        this.#pos.x = value;
        this.#checkBounds();
    }
    set y(value) {
        this.#pos.y = value;
        this.#checkBounds();
    }
    get x() {
        return this.#pos.x;
    }
    get y() {
        return this.#pos.y;
    }
    setLevelDim(dim: Dimensions) {
        this.#levelDim = {w: dim.w, h: dim.h};
        this.#checkBounds();
    }
    #checkBounds() {
        if (this.#levelDim) {
            this.#pos.x = clamp(this.#pos.x, 0, this.#levelDim.w - SCREEN_DIM.w);
            this.#pos.y = clamp(this.#pos.y, 0, this.#levelDim.h - SCREEN_DIM.h);
        }
    }
    getPos(): Point {
        return Object.assign({}, this.#pos);
    }
    getViewOffset(): Point {
        return {x: Math.round(-this.#pos.x), y: Math.round(-this.#pos.y)};
    }
}
