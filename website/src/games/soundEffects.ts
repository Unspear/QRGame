import { Game } from "../game";

let script = `local noise1 = createEntity("N1",0,48,32)
noise1.input.enabled = true
noise1.input.press = function()
    audio.noise(0.5).addLowpass(10000).driveFrequency(audio.linear(1000, 0.25)).addGain(1.0).driveGain(audio.linear(0.0, 0.5)).output()
end
local noise2 = createEntity("N2",0,144,32)
noise2.input.enabled = true
noise2.input.press = function()
    audio.noise(0.5).addLowpass(50).driveFrequency(audio.exp(10000, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local noise3 = createEntity("N3",0,48,80)
noise3.input.enabled = true
noise3.input.press = function()
    audio.noise(0.5).addLowpass(10000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local noise4 = createEntity("N4",0,144,80)
noise4.input.enabled = true
noise4.input.press = function()
    audio.noise(0.5).addLowpass(1000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local bling = createEntity("🥇",0,48,128)
bling.input.enabled = true
bling.input.press = function()
    audio.triangle("A5", 1).driveDetune(audio.square(12, 1).addGain(300), audio.square(6, 1).addGain(600)).addLowpass(1000).addGain(1.0).driveGain(audio.linear(0, 1)).output()
end
local ring = createEntity("☎",0,144,128)
ring.input.enabled = true
ring.input.press = function()
    audio.triangle("C5", 1.25).driveDetune(audio.square(12, 1.25).addGain(300)).addLowpass(400).addGain(1.0).driveGain(audio.step(1, 1), audio.linear(0, 1.25)).output()
end
local laser = createEntity("🔫",0,48,176)
laser.input.enabled = true
laser.input.press = function()
    audio.sawtooth("C6", 0.5).driveFrequency(audio.triangle(120, 0.5).addGain(100), audio.linear("C5", 0.25)).addLowpass(1800).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local witch = createEntity("🧹",0,144,176)
witch.input.enabled = true
witch.input.press = function()
    audio.sawtooth('A4', 3.5).driveDetune(audio.sine(18, 3.5).driveFrequency(audio.sine(12, 3.5).addGain(50)).addGain(150)).driveFrequency(audio.linear("G3", 3)).addLowpass(1000).driveFrequency(audio.triangle(4, 3.5).addGain(1000)).addGain(1).driveGain(audio.linear(1, 0.125), audio.linear(0, 3.5)).output()
end
local alarm = createEntity("🚨",0,48,224)
alarm.input.enabled = true
alarm.input.press = function()
    audio.sine("A4", 2).driveDetune(audio.sine(2, 2).addGain(600)).addLowpass(800).addGain(1).driveGain(audio.linear(0, 2)).output()
end
local gameOver = createEntity("💀",0,144,224)
gameOver.input.enabled = true
gameOver.input.press = function()
    audio.sawtooth("A3", 4).driveDetune(audio.sine(4, 4).addGain(100)).driveFrequency(audio.linear("E2", 3)).addLowpass(1200).addGain(1).driveGain(audio.linear(0, 4)).output()
end`
export default function (): Game {
    let game = new Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}