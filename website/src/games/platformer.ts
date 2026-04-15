import { Game } from "../game";
import { stringToCodePoints } from "../util";

let script = `local left = createScreenEntity(" <- ", 8, 32, 234)
left.input.enabled = true
left.input.dim = {x = 64, y = 48}
left.input.key = "arrowleft"
local right = createScreenEntity(" -> ", 8, 96, 234)
right.input.enabled = true
right.input.dim = {x = 64, y = 48}
right.input.key = "arrowright"
local player = createEntity('🕴', 0, 128, 176)
player.physics.enabled = true
player.physics.simulate = true
player.physics.dim = {x=6, y=14}
player.frame = function()
  if player.physics.vel.y > -0.5 then
    player.physics.vel.y = player.physics.vel.y + FRAME_TIME * 3
  else
    player.physics.vel.y = player.physics.vel.y + FRAME_TIME * 6
  end
  camera.x = player.pos.x - 96
  camera.y = player.pos.y - 128
  local vel = 0
  if right.input.down then
    vel = vel + 1
  end
  if left.input.down then
    vel = vel - 1
  end
  player.physics.vel.x = vel
  if player.pos.y > 352 then
    endGame("💀Game Over💀")
  elseif player.pos.x > 2208 then
    endGame("🎇You Win🎇")
  end
end

local jump = createScreenEntity("JUMP", 8, 160, 234)
jump.input.enabled = true
jump.input.dim = {x = 64, y = 48}
jump.input.key = "arrowup"
jump.input.press = function()
  if player.physics.onFloor then
    player.physics.vel.y = -3.2
  end
end
local timer = createScreenEntity("", 4, 192-6, 6)
timer.sprite.pivot = {x=1,y=-1}
local seconds = 0
timer.frame = function()
  seconds = seconds + FRAME_TIME
  timer.sprite.char = tostring(math.floor(seconds*10.0))
end
local health = createScreenEntity("🖤🖤🖤", 2, 6, 6)
health.sprite.pivot = {x=-1,y=-1}`
let tiles: string = '{"tileMap":{"dim":{"w":2,"h":8},"count":12,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,35,35,61,61,61,61,61,61],"color":[14,14,14,14,14,14,14,14,10,10,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,35,35,61,61,61,61,61,61,61,61,61,61],"color":[14,14,14,14,10,10,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[35,35,61,61,61,61,61,61,61,61,61,61,61,61,61,61],"color":[10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[32,32,35,35,32,32,32,32,35,35,61,61,61,61,61,61],"color":[14,14,9,9,14,14,14,14,10,10,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,9,9,14,14,14,14]},{"codePoint":[72,72,72,72,72,72,72,72,72,72,72,72,72,72,72,72],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,128638,128638,61,61,61,61,61,61],"color":[14,14,14,14,14,14,14,14,8,8,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]}]},"patchMap":{"dim":{"w":72,"h":2},"tileData":{"patchId":[6,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,1,1,1,4,3,3,3,3,4,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,6],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}'
export default function (): Game {
    let parsed = JSON.parse(tiles);
    let game = new Game({ title: "Platformer", description: "A platformer" }, script, parsed.tileMap, parsed.patchMap);
    game.solidTiles = stringToCodePoints('#=H🙾');
    return game;
}