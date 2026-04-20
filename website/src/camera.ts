import { SCREEN_DIM } from "./constants";
import { Dimensions, Point, clamp } from "./util";

export class Camera {
    pos: Point;
    #levelDim: Dimensions | undefined;
    constructor() {
        this.pos = {x: 0, y: 0};
    }
    setLevelDim(dim: Dimensions) {
        this.#levelDim = {w: dim.w, h: dim.h};
        this.checkBounds();
    }
    checkBounds() {
        if (this.#levelDim) {
            this.pos.x = clamp(this.pos.x, 0, this.#levelDim.w - SCREEN_DIM.w);
            this.pos.y = clamp(this.pos.y, 0, this.#levelDim.h - SCREEN_DIM.h);
        }
    }
    getViewOffset(): Point {
        this.checkBounds();
        return {x: Math.round(-this.pos.x), y: Math.round(-this.pos.y)};
    }
}
