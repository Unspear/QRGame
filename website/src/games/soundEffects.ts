import { Game } from "../game";

let script = `-- Noise 1
--audio.noise(0.5).addLowpass(10000).driveFrequency(audio.linear(1000, 0.25)).addGain(1.0).driveGain(audio.linear(0.0, 0.5)).output()
-- Noise 2
--audio.noise(0.5).addLowpass(50).driveFrequency(audio.exp(10000, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Noise 3
--audio.noise(0.5).addLowpass(10000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Noise 4
--audio.noise(0.5).addLowpass(1000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Bling
--audio.triangle("A5", 1).driveDetune(audio.square(12, 1).addGain(300), audio.square(6, 1).addGain(600)).addLowpass(1000).addGain(1.0).driveGain(audio.linear(0, 1)).output()
-- Ring
--audio.triangle("C5", 1.25).driveDetune(audio.square(12, 1.25).addGain(300)).addLowpass(400).addGain(1.0).driveGain(audio.step(1, 1), audio.linear(0, 1.25)).output()
-- Laser
--audio.sawtooth("C6", 0.5).driveFrequency(audio.triangle(120, 0.5).addGain(100), audio.linear("C5", 0.25)).addLowpass(1800).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Witch
audio.sawtooth('A4', 3.5).driveDetune(audio.sine(18, 3.5).driveFrequency(audio.sine(12, 3.5).addGain(50)).addGain(150)).driveFrequency(audio.linear("G3", 3)).addLowpass(1000).driveFrequency(audio.triangle(4, 3.5).addGain(1000)).addGain(1).driveGain(audio.linear(1, 0.125), audio.linear(0, 3.5)).output()
-- Emergency
--audio.sine("A4", 2).driveDetune(audio.sine(2, 2).addGain(600)).addLowpass(800).addGain(1).driveGain(audio.linear(0, 2)).output()
-- Game Over
--audio.sawtooth("A3", 4).driveDetune(audio.sine(4, 4).addGain(100)).driveFrequency(audio.linear("E2", 3)).addLowpass(1200).addGain(1).driveGain(audio.linear(0, 4)).output()`
export default function (): Game {
    let game = new Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}