import { Game } from "../game";

let script = `-- Paddles
local top = createEntity('----', 8, 96, 32)
top.physics.enabled = true
top.physics.static = true
top.physics.dim.x = 32
local bottom = copyEntity(top)
bottom.pos.y = 256 - 32
-- Ball
local ball = createEntity('⬤', 4, 96, 128)
ball.physics.enabled = true
ball.physics.bounce = 1.0
ball.physics.dim.x = 16
-- Control Paddles
function onDrag(pos)
  local x = math.min(math.max(pos.x, 32), 192-32)
  if pos.y < 64 then
    top.pos.x = x
  elseif pos.y > (256-64) then
    bottom.pos.x = x
  end
end
-- Score
top.score = 0
bottom.score = 0
local topScore = createEntity('', 12, 20, 4)
topScore.sprite.pivot = {x = -1, y = -1}
local bottomScore = createEntity('', 12, 192-20, 256-4)
bottomScore.sprite.pivot = {x = 1, y = 1}
-- Update score and reset ball
function newRound()
    topScore.sprite.char = tostring(top.score)
    bottomScore.sprite.char = tostring(bottom.score)
    ball.pos.x = 96
    local dirY = math.random(0, 1)*2-1
    ball.pos.y = 128-dirY*64
    ball.physics.vel.y = dirY*3
    ball.physics.vel.x = (math.random(0, 1)*2-1)*1.5
end
newRound()
-- Update
function onUpdate()
    if ball.pos.y < 0 then
        top.score = top.score + 1
        newRound()
    end
    if ball.pos.y > 256 then
        bottom.score = bottom.score + 1
        newRound()
    end
end`
let tiles: string = '{"tileMap":{"dim":{"w":12,"h":1},"count":1,"tileData":[{"codePoint":[35,32,32,32,32,32,32,32,32,32,32,35],"colour":[9,0,0,0,0,0,0,0,0,0,0,9]}]},"patchMap":{"dim":{"w":1,"h":16},"tileData":{"patchId":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}'
export default function (): Game {
    let parsed = JSON.parse(tiles);
    let game = new Game({title: "Air Hockey", description: "A 2-player air hockey game, showing how bouncy physics can be used"}, script, parsed.tileMap, parsed.patchMap);
    game.solidTiles = ['#'.codePointAt(0)!];
    return game;
}