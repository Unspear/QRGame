import { Game } from "../game";

let script = `
-- Noise 1
makeNoise(0.5).addLowpass(10000).setFrequency(modLinear(1000, 0.25)).addGain(1.0).setGain(modLinear(0.0, 0.5)).output()
-- Noise 2
makeNoise(0.5).addLowpass(50).setFrequency(modExp(1000, 0.25)).addGain(1.0).setGain(modLinear(0, 0.5)).output()
-- Noise 3
makeNoise(0.5).addLowpass(10000).setFrequency(modExp(10, 0.25)).addGain(1.0).setGain(modLinear(0, 0.5)).output()
-- Noise 4
makeNoise(0.5).addLowpass(1000).setFrequency(modExp(10, 0.25)).addGain(1.0).setGain(modLinear(0, 0.5)).output()
-- Bling
makeWave("triangle", "A5", 1).setDetune(makeWave("square", 12, 1).setGain(300)).addLowpass(1000).addGain(1.0).setGain(modLinear(0, 1)).output()
-- Ring
makeWave("triangle", "C5", 1.25).setDetune(makeWave("square", 12, 1.25).setGain(300)).addLowpass(400).addGain(1.0).setGain(modStep(1, 1)).setGain(modLinear(0, 1.25)).output()
-- Laser
makeWave("sawtooth", "c6", 0.5).setFrequency(makeWave("triangle", 120, 0.5).setGain(100)).addLowpass(1800).addGain(1.0).setGain(modLinear(0, 0.5)).output()
`
export default function (): Game {
    let game = new Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}