import { LuaExecutor } from "./engine";

export class Timer {
    duration: number;
    frame: Function | undefined;
    finish: Function | undefined;
    #time: number;
    constructor(duration: number) {
        this.duration = duration;
        this.#time = 0;
    }
    get finished() {
        return this.#time > this.duration;
    }
    update(deltaTime: number, luaExecutor: LuaExecutor) {
        if (this.#time > this.duration) {
            return;
        }
        this.#time += deltaTime;
        luaExecutor(this.frame);
        if (this.#time > this.duration) {
            luaExecutor(this.finish);
        }
    }
}