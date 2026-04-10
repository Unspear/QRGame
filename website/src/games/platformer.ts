import { Game } from "../game";

let script = `local player = createEntity('🕴', 0, 96, 128)
player.physics.enabled = true
player.physics.simulate = true
player.physics.dim = {x=8, y=14}
player.frame = function()
  if player.physics.vel.y > -0.5 then
    player.physics.vel.y = player.physics.vel.y + FRAME_TIME * 3
  else
    player.physics.vel.y = player.physics.vel.y + FRAME_TIME * 6
  end
  camera.x = player.pos.x - 96
  camera.y = player.pos.y - 128
  player.physics.vel.x = 0
end
local left = createEntity(" <- ", 8, 32, 256-32)
left.input.enabled = true
left.input.dim = {x = 64, y = 48}
left.input.key = "arrowleft"
left.input.hold = function()
  player.physics.vel.x = -1
end
local right = createEntity(" -> ", 8, 96, 256-32)
right.input.enabled = true
right.input.dim = {x = 64, y = 48}
right.input.key = "arrowright"
right.input.hold = function() 
  player.physics.vel.x = 1
end
local jump = createEntity("JUMP", 8, 160, 256-32)
jump.input.enabled = true
jump.input.dim = {x = 64, y = 48}
jump.input.key = "arrowup"
jump.input.press = function()
  player.physics.vel.y = -2
end`
let tiles: string = '{"tileMap":{"dim":{"w":2,"h":8},"count":12,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,35,35,61,61,61,61,61,61],"color":[14,14,14,14,14,14,14,14,10,10,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,35,35,61,61,61,61,61,61,61,61,61,61],"color":[14,14,14,14,10,10,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[35,35,61,61,61,61,61,61,61,61,61,61,61,61,61,61],"color":[10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[32,32,35,35,32,32,32,32,35,35,61,61,61,61,61,61],"color":[14,14,9,9,14,14,14,14,10,10,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,9,9,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]}]},"patchMap":{"dim":{"w":72,"h":2},"tileData":{"patchId":[0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,4,3,3,3,3,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}'
export default function (): Game {
    let parsed = JSON.parse(tiles);
    let game = new Game({ title: "Platformer", description: "A platformer" }, script, parsed.tileMap, parsed.patchMap);
    game.solidTiles = ['#'.codePointAt(0)!];
    return game;
}