import { decorate, decorateProxy, decorateUserdata } from "wasmoon";
import { LuaExecutor } from "./engine";

export class Timer {
    duration: number;
    onUpdate: Function | undefined;
    onFinish: Function | undefined;
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
        luaExecutor(this.onUpdate);
        if (this.#time > this.duration) {
            luaExecutor(this.onFinish);
        }
    }
    wrapped() {
        return decorate(
            {
                instance: decorateUserdata(this)
            },
            {
                metatable: {
                    __index: (self: {instance: Timer}, key: any) => {
                        if (key === "duration") {
                            return self.instance.duration;
                        }
                        if (key === "onUpdate") {
                            return self.instance.onUpdate;
                        }
                        if (key === "onFinish") {
                            return self.instance.onFinish;
                        }
                        if (key === "finished") {
                            return self.instance.finished;
                        }
                    },
                    __newindex: (self: {instance: Timer}, key: any, val: any) => {
                        if (key === "duration") {
                            self.instance.duration = val;
                            return;
                        }
                        if (key === "onUpdate") {
                            self.instance.onUpdate = val;
                            return;
                        }
                        if (key === "onFinish") {
                            self.instance.onFinish = val;
                            return;
                        }
                        throw Error("Timer does not have variable '"+String(key)+"'");
                    },
                },
            },
        )
    }
}