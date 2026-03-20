import { Game } from "../game";

let script = `local noise1 = createSprite("N1",0,48,32)
noise1.physics = true
noise1.tap = function()
    audio.noise(0.5).addLowpass(10000).driveFrequency(audio.linear(1000, 0.25)).addGain(1.0).driveGain(audio.linear(0.0, 0.5)).output()
end
local noise2 = createSprite("N2",0,144,32)
noise2.physics = true
noise2.tap = function()
    audio.noise(0.5).addLowpass(50).driveFrequency(audio.exp(10000, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local noise3 = createSprite("N3",0,48,80)
noise3.physics = true
noise3.tap = function()
    audio.noise(0.5).addLowpass(10000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local noise4 = createSprite("N4",0,144,80)
noise4.physics = true
noise4.tap = function()
    audio.noise(0.5).addLowpass(1000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local bling = createSprite("🥇",0,48,128)
bling.physics = true
bling.tap = function()
    audio.triangle("A5", 1).driveDetune(audio.square(12, 1).addGain(300), audio.square(6, 1).addGain(600)).addLowpass(1000).addGain(1.0).driveGain(audio.linear(0, 1)).output()
end
local ring = createSprite("☎",0,144,128)
ring.physics = true
ring.tap = function()
    audio.triangle("C5", 1.25).driveDetune(audio.square(12, 1.25).addGain(300)).addLowpass(400).addGain(1.0).driveGain(audio.step(1, 1), audio.linear(0, 1.25)).output()
end
local laser = createSprite("🔫",0,48,176)
laser.physics = true
laser.tap = function()
    audio.sawtooth("C6", 0.5).driveFrequency(audio.triangle(120, 0.5).addGain(100), audio.linear("C5", 0.25)).addLowpass(1800).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
end
local witch = createSprite("🧹",0,144,176)
witch.physics = true
witch.tap = function()
    audio.sawtooth('A4', 3.5).driveDetune(audio.sine(18, 3.5).driveFrequency(audio.sine(12, 3.5).addGain(50)).addGain(150)).driveFrequency(audio.linear("G3", 3)).addLowpass(1000).driveFrequency(audio.triangle(4, 3.5).addGain(1000)).addGain(1).driveGain(audio.linear(1, 0.125), audio.linear(0, 3.5)).output()
end
local alarm = createSprite("🚨",0,48,224)
alarm.physics = true
alarm.tap = function()
    audio.sine("A4", 2).driveDetune(audio.sine(2, 2).addGain(600)).addLowpass(800).addGain(1).driveGain(audio.linear(0, 2)).output()
end
local gameOver = createSprite("💀",0,144,224)
gameOver.physics = true
gameOver.tap = function()
    audio.sawtooth("A3", 4).driveDetune(audio.sine(4, 4).addGain(100)).driveFrequency(audio.linear("E2", 3)).addLowpass(1200).addGain(1).driveGain(audio.linear(0, 4)).output()
end`
export default function (): Game {
    let game = new Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}