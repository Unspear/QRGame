import { Sound } from "retro-sound";
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

export class SoundNode {
    #engine: AudioEngine;
    #node: AudioNode;
    constructor(engine: AudioEngine, audioNode: AudioNode) {
        this.#engine = engine;
        this.#node = audioNode;
    }
    #createChild(child: AudioNode): SoundNode {
        this.#node.connect(child);
        return new SoundNode(this.#engine, child);
    }
    lowpass(frequency: number): SoundNode {
        return this.#createChild(new BiquadFilterNode(this.#node.context, {
            type: "lowpass",
            frequency: frequency,
        }));
    }
    highpass(frequency: number): SoundNode {
        return this.#createChild(new BiquadFilterNode(this.#node.context, {
            type: "highpass",
            frequency: frequency,
        }));
    }
    volume(volume: number): SoundNode {
        return this.#createChild(new GainNode(this.#node.context, { 
            gain: volume
        }));
    }
    output() {
        this.#node.connect(this.#engine.output);
    }
}

export class SoundParam {
    
}

export class AudioEngine {
    tts: SamJs;
    ctx: AudioContext;
    output: GainNode;
    #noiseBuffer: AudioBuffer;
    constructor() {
        this.tts = new SamJs();
        this.ctx = new AudioContext();
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
        this.setVolume(0.25);
        this.#noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        let output = this.#noiseBuffer.getChannelData(0);
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
    // Generators
    makeWave(type: Exclude<OscillatorType, "custom">, note: string, length: number): SoundNode {
        let oscNode = this.ctx.createOscillator();
        oscNode.type = type;
        oscNode.frequency.value = noteToFrequency(note);
        oscNode.start();
        oscNode.stop(length);
        return new SoundNode(this, oscNode);
    }
    makeNoise(length: number): SoundNode {
        let noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = this.#noiseBuffer;
        noiseNode.loop = true;
        noiseNode.start();
        noiseNode.stop(length);
        return new SoundNode(this, noiseNode);
    }
    makeSpeech(text: string): SoundNode {
        // Replace non-ascii and control characters with space
        const speechData = this.tts.buf8(text.replace(/[^\x20-\x7E]/g, " ")) as Uint8Array;
        const speechBuffer = this.ctx.createBuffer(1, speechData.length, 22050);
        const speechChannelData = speechBuffer.getChannelData(0);
        for (let i = 0; i < speechData.length; i++) {
            speechChannelData[i] = speechData[i] / 127.5 - 1;
        }
        const speechNode = this.ctx.createBufferSource();
        speechNode.buffer = speechBuffer;
        speechNode.start();
        return new SoundNode(this, speechNode);
    }
}