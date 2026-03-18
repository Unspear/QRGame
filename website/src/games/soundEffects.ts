import { Game } from "../game";

let script = `-- Noise
makeNoise(0.5).addLowpass(10000).setFrequency(modLinear(1000, 0.25)).addGain(1.0).setGain(modLinear(0.0, 0.5)).output()`
export default function (): Game {
    let game = new Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}