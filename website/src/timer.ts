
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
    update(deltaTime: number) {
        if (this.#time > this.duration) {
            return;
        }
        this.#time += deltaTime;
        if (this.frame instanceof Function) {
            this.frame();
        }
        if (this.#time > this.duration) {
            if (this.finish instanceof Function) {
                this.finish();
            }
        }
    }
}