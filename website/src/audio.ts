import SamJs from "sam-js";

function noteToFrequency(note: string): number {
	return 440 * Math.pow(2, (noteToMIDI(note) - 69) / 12);
}

function noteToMIDI(note: string): number {
	const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const octave = parseInt(note.slice(-1));
	const noteName = note.slice(0, -1);
	return (octave + 1) * 12 + noteNames.indexOf(noteName.toUpperCase());
}

export type FrequencyInput = number | string;

function parseFrequency(input: FrequencyInput): number {
    return (typeof input === "string") ? noteToFrequency(input) : input;
}
export type SoundModType = "linear" | "exponential" | "step";
export class SoundMod {
    type: SoundModType;
    value: number;
    duration: number;
    constructor(type: SoundModType, value: number, duration: number) {
        this.type = type;
        this.value = value;
        this.duration = duration;
    }
}
export type SoundModInput = number | SoundMod | AudioNodeWrapper<AudioNode>;
function driveValue(ctx: BaseAudioContext, target: AudioParam, inputs: SoundModInput[]) {
    for(let input of inputs) {
         if (input instanceof AudioNodeWrapper) {
            input.modulate(target);
        } else if (typeof input === "number") {
            target.setValueAtTime(input, ctx.currentTime);
        } else {
            switch(input.type) {
            case "linear":
                target.linearRampToValueAtTime(input.value, ctx.currentTime + input.duration);
                break;
            case "exponential":
                target.exponentialRampToValueAtTime(input.value, ctx.currentTime + input.duration);
                break;
            case "step":
                target.setValueAtTime(input.value, ctx.currentTime + input.duration);
                break;
            }
        }
    }
}

export class AudioNodeWrapper<T extends AudioNode> {
    #engine: AudioEngine;
    protected node: T;
    constructor(engine: AudioEngine, audioNode: T) {
        this.#engine = engine;
        this.node = audioNode;
    }
    addLowpass(frequency: number): FilterSoundNode {
        let newNode = new FilterSoundNode(this.#engine, new BiquadFilterNode(this.node.context, {
            type: "lowpass",
            frequency: frequency,
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    addHighpass(frequency: number): FilterSoundNode {
        let newNode = new FilterSoundNode(this.#engine, new BiquadFilterNode(this.node.context, {
            type: "highpass",
            frequency: frequency,
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    addGain(gain: number): GainSoundNode {
        let newNode = new GainSoundNode(this.#engine, new GainNode(this.node.context, {
            gain: gain
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    modulate(target: AudioParam) {
        this.node.connect(target);
    }
    output() {
        this.node.connect(this.#engine.output);
    }
}

export class BaseSoundNode extends AudioNodeWrapper<AudioNode> {
}

export class BufferSoundNode extends AudioNodeWrapper<AudioBufferSourceNode> {
    driveRate(...rate: SoundModInput[]): BufferSoundNode {
        driveValue(this.node.context, this.node.playbackRate, rate);
        return this;
    }
    driveDetune(...cents: SoundModInput[]): BufferSoundNode {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
}

export class OscillatorSoundNode extends AudioNodeWrapper<OscillatorNode> {
    driveFrequency(...frequency: SoundModInput[]): OscillatorSoundNode {
        driveValue(this.node.context, this.node.frequency, frequency);
        return this;
    }
    driveDetune(...cents: SoundModInput[]): OscillatorSoundNode {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
}

export class FilterSoundNode extends AudioNodeWrapper<BiquadFilterNode> {
    driveQuality(...quality: SoundModInput[]): FilterSoundNode {
        driveValue(this.node.context, this.node.Q, quality);
        return this;
    }
    driveFrequency(...frequency: SoundModInput[]): FilterSoundNode {
        driveValue(this.node.context, this.node.frequency, frequency);
        return this;
    }
    driveDetune(...cents: SoundModInput[]): FilterSoundNode {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
    driveGian(...gain: SoundModInput[]): FilterSoundNode {
        driveValue(this.node.context, this.node.gain, gain);
        return this;
    }
}

export class GainSoundNode extends AudioNodeWrapper<GainNode> {
    driveGain(...gain: SoundModInput[]): GainSoundNode {
        driveValue(this.node.context, this.node.gain, gain);
        return this;
    }
}


export class AudioEngine {
    tts: SamJs;
    ctx: AudioContext;
    output: GainNode;
    noiseBuffer: AudioBuffer;
    constructor() {
        this.tts = new SamJs();
        this.ctx = new AudioContext();
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
        this.setVolume(0.25);
        this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        let output = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }
    setPaused(value: boolean) {
        if (value) {
            this.ctx.suspend();
        } else {
            this.ctx.resume();
        }
    }
    close() {
        this.ctx.close();
    }
    setVolume(value: number) {
        this.output.gain.value = value;
    }
    getVolume(): number {
        return this.output.gain.value;
    }
}

export class AudioAccessor {
    #engine: AudioEngine;
    constructor(engine: AudioEngine) {
        this.#engine = engine;
    }
    wave(type: OscillatorType, frequency: FrequencyInput, length: number): OscillatorSoundNode {
        let oscNode = this.#engine.ctx.createOscillator();
        oscNode.type = type;
        oscNode.frequency.value = parseFrequency(frequency);
        oscNode.start();
        oscNode.stop(this.#engine.ctx.currentTime + length);
        return new OscillatorSoundNode(this.#engine, oscNode);
    }
    triangle(frequency: FrequencyInput, length: number): OscillatorSoundNode {
        return this.wave("triangle", frequency, length)
    }
    sawtooth(frequency: FrequencyInput, length: number): OscillatorSoundNode {
        return this.wave("sawtooth", frequency, length)
    }
    sine(frequency: FrequencyInput, length: number): OscillatorSoundNode {
        return this.wave("sine", frequency, length)
    }
    square(frequency: FrequencyInput, length: number): OscillatorSoundNode {
        return this.wave("square", frequency, length)
    }
    noise(length: number): BufferSoundNode {
        let noiseNode = this.#engine.ctx.createBufferSource();
        noiseNode.buffer = this.#engine.noiseBuffer;
        noiseNode.loop = true;
        noiseNode.start();
        noiseNode.stop(this.#engine.ctx.currentTime + length);
        return new BufferSoundNode(this.#engine, noiseNode);
    }
    speech(text: string, length: number = 0): BufferSoundNode {
        // Replace non-ascii and control characters with space
        const speechData = this.#engine.tts.buf8(text.replace(/[^\x20-\x7E]/g, " ")) as Uint8Array;
        const speechBuffer = this.#engine.ctx.createBuffer(1, speechData.length, 22050);
        const speechChannelData = speechBuffer.getChannelData(0);
        for (let i = 0; i < speechData.length; i++) {
            speechChannelData[i] = speechData[i] / 127.5 - 1;
        }
        const speechNode = this.#engine.ctx.createBufferSource();
        speechNode.buffer = speechBuffer;
        speechNode.start();
        if (length > 0) {
            speechNode.loop = true;
            speechNode.stop(this.#engine.ctx.currentTime + length);
        }
        return new BufferSoundNode(this.#engine, speechNode);
    }
    linear(value: FrequencyInput, duration: number): SoundMod {
        return new SoundMod("linear", parseFrequency(value), duration);
    }
    exp(value: FrequencyInput, duration: number): SoundMod {
        return new SoundMod("exponential", parseFrequency(value), duration);
    }
    step(value: FrequencyInput, duration: number): SoundMod {
        return new SoundMod("step", parseFrequency(value), duration);
    }
}