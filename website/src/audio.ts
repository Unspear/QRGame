import SamJs from "sam-js";

export class AudioEngine {
    tts: SamJs;
    ctx: AudioContext;
    output: GainNode;
    constructor() {
        this.tts = new SamJs();
        this.ctx = new AudioContext();
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
        this.setVolume(0.25);
    }
    setPaused(value: boolean) {
        if (value) {
            this.ctx.suspend();
        } else {
            this.ctx.resume();
        }
    }
    reset() {
        this.ctx.close();
        this.ctx = new AudioContext();
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
        this.setVolume(0.25);
    }
    setVolume(value: number) {
        this.output.gain.value = value;
    }
    getVolume(): number {
        return this.output.gain.value;
    }
    playNote(length: number) {
        let osc = this.ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 1000;
        osc.connect(this.output);
        console.log("Note begin");
        osc.start();
        osc.stop(length);
        osc.onended = function() {
            console.log("Note end");
            this.disconnect(); 
        }
    }
    say(text: string) {
        // Replace non-ascii and control characters with space
        const speechData = this.tts.buf8(text.replace(/[^\x20-\x7E]/g, " "))
        if (speechData instanceof Uint8Array) {
            const speechBuffer = this.ctx.createBuffer(1, speechData.length, 22050);
            const speechChannelData = speechBuffer.getChannelData(0);
            for (let i = 0; i < speechData.length; i++) {
                speechChannelData[i] = speechData[i] / 127.5 - 1;
            }
            const src = this.ctx.createBufferSource();
            src.buffer = speechBuffer;
            src.connect(this.output);
            console.log("Speak begin");
            src.start();
            src.onended = function() {
                console.log("Speak end");
                this.disconnect(); 
            }
        }
    }
}