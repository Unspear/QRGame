import { Game } from "../game";
import { stringToCodePoints } from "../util";

let script = `-- Health 
local healthVal = 3;
-- Game timer setup
local timer = createScreenEntity("", 4, 192-6, 6)
timer.sprite.pivot = {x=1,y=-1}
local seconds = 0
timer.onUpdate = function()
  seconds = seconds + DELTA_TIME
  timer.sprite.char = tostring(math.floor(seconds*10.0))
end
-- Stop game functions
function gameOver()
  -- Happy melody
  audio.mml("sawtooth", "t180 o2 l8 b r8 g r8 e2").output()
  -- Stop game with game over screen
  stopGame("💀Game Over💀")
end
function youWin()
  -- Sad melody
  audio.mml("square", "t360 o3 g e g > c2").output()
  -- Stop game with You win, showing time and health
  stopGame("🎇You Win🎇", "Time: "..math.floor(seconds*10.0), "Health: "..string.rep("🖤", healthVal))
end
-- Left right input
local left = createScreenEntity(" <- ", 8, 32, 234)
left.input.enabled = true
left.input.dim = {x = 64, y = 48}
left.input.key = "arrowleft"
local right = createScreenEntity(" -> ", 8, 96, 234)
right.input.enabled = true
right.input.dim = {x = 64, y = 48}
right.input.key = "arrowright"
-- Player Setup
local player = createEntity('🐿', 4, 128, 176)
player.physics.enabled = true
player.physics.dim = {x=10, y=12}
player.onUpdate = function()
  -- Gravity (gravity is lower when rising, for better game feel)
  if player.physics.vel.y > -0.5 then
    player.physics.vel.y = player.physics.vel.y + DELTA_TIME * 6
  else
    player.physics.vel.y = player.physics.vel.y + DELTA_TIME * 12
  end
  -- Update camera to centre on player
  camera.pos.x = player.pos.x - 96
  camera.pos.y = player.pos.y - 128
  -- Update velocity based on left right input
  local vel = 0
  if right.input.down then
    vel = vel + 1
  end
  if left.input.down then
    vel = vel - 1
  end
  player.physics.vel.x = vel * 2
  -- Update sprite facing direction based on velocity
  if vel ~= 0 then
    player.sprite.fliph = vel > 0
  end
  -- Game over if the player falls out the level,
  -- Game win if they reach the end
  if player.pos.y > 352 then
    gameOver()
  elseif player.pos.x > 1472 and player.physics.onFloor then
    youWin()
  end
end
-- Jump input
local jump = createScreenEntity("JUMP", 8, 160, 234)
jump.input.enabled = true
jump.input.dim = {x = 64, y = 48}
jump.input.key = "arrowup"
jump.input.onPress = function()
  if player.physics.onFloor then
    player.physics.vel.y = -4.5
    -- Jump sound effect (level for 0.1 seconds and then rising by 600 cents for the remaining 0.15 seconds)
    audio.square("C4", 0.25).driveDetune(audio.step(0, 0.1), audio.linear(600, 0.25)).output()
  end
end
-- Health system
local health = createScreenEntity("🖤🖤🖤", 2, 6, 6)
health.sprite.pivot = {x=-1,y=-1}
local healthTimer = nil
function damage() 
  if healthTimer == nil or healthTimer.finished then
    healthVal = healthVal - 1
    health.sprite.char = string.rep("🖤", healthVal)
    -- Game over if no health
    if healthVal == 0 then
      gameOver()
      return
    end
    -- Hurt sound effect
    audio.sawtooth("A2", 0.5).addGain(0).driveGain(audio.linear(1.0, 0.1), audio.linear(0.0, 0.4)).output()
    audio.noise(0.5).addLowpass(500).addGain(0.3).output()
    healthTimer = createTimer(1)
    healthTimer.onUpdate = function()
      player.sprite.enabled = not player.sprite.enabled
    end
    healthTimer.onFinish = function()
      player.sprite.enabled = true
    end
  end
end
-- Spawn geese
for i, v in ipairs(getMarkers('g')) do
  local goose = createEntity('🪿', 2, v.x, v.y)
  goose.physics.enabled = true
  goose.physics.friction = 1.0
  goose.physics.ghost = true
  goose.physics.dim.x = 10
  goose.onUpdate = function(self)
    -- Gravity
    self.physics.vel.y = self.physics.vel.y + DELTA_TIME * 3
    -- Damage player if they are overlapping
    for i, v in ipairs(goose.physics.overlapping) do
      if v == player then
        damage()
      end
    end
    -- Jump, with some randomness
    if math.random() < 0.1 and self.physics.onFloor then
      self.physics.vel.y = -2
    end
  end
end`
let tiles: string = '{"tileMap":{"dim":{"w":2,"h":8},"count":12,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,87,77,45,61,61,45,45,61],"colour":[0,0,0,0,0,0,0,0,13,13,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,87,77,45,61,61,45,45,61,61,45,45,61],"colour":[0,0,0,0,13,13,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[87,77,45,61,61,45,45,61,61,45,45,61,61,45,45,61],"colour":[13,13,11,11,11,11,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[32,32,91,93,32,32,32,32,87,77,45,61,61,45,45,61],"colour":[0,0,9,9,0,0,0,0,13,13,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,91,93,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0]},{"codePoint":[72,72,72,72,72,72,72,72,72,72,72,72,72,72,72,72],"colour":[9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9]},{"codePoint":[32,32,32,32,32,32,32,32,128638,128638,45,61,61,45,45,61],"colour":[0,0,0,0,0,0,0,0,8,8,11,11,11,11,11,11]},{"codePoint":[32,32,11204,11204,11204,11204,32,32,32,32,32,32,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,11204,11204,11204,11204,32,32,32,32,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,11204,11204,11204,11204,32,32,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,11204,11204,11204,11204,32,32,32,32],"colour":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]},"patchMap":{"dim":{"w":48,"h":2},"tileData":{"patchId":[6,0,10,9,10,0,0,11,10,10,11,0,0,0,0,11,10,10,11,0,0,5,5,0,5,5,0,0,5,5,5,0,1,1,0,0,9,8,8,9,10,11,10,0,11,10,0,6,6,1,1,1,1,1,1,1,1,0,1,1,0,1,1,2,1,4,4,3,3,3,2,1,1,1,2,2,1,1,1,1,3,3,3,1,1,1,1,1,1,1,1,1,1,1,7,6],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},"markers":[{"x":29,"y":11,"codePoint":103},{"x":40,"y":7,"codePoint":103},{"x":58,"y":4,"codePoint":103},{"x":75,"y":11,"codePoint":103},{"x":81,"y":11,"codePoint":103},{"x":87,"y":11,"codePoint":103},{"x":86,"y":11,"codePoint":103}]}'
export default function (): Game {
    let parsed = JSON.parse(tiles);
    let game = new Game({ title: "Platformer", description: "A platformer game that demonstrates all engine features" }, script, parsed.tileMap, parsed.patchMap);
    game.markers = parsed.markers;
    game.solidTiles = stringToCodePoints('-=WMH[]🙾');
    return game;
}