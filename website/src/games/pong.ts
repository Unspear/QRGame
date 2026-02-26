import { Game } from "../game";
import { TileMap } from "../tile";

let script = `-- Paddles
local top = createSprite('----', 8, 96, 32)
top.width = 32
top.physics = true
top.static = true
local bottom = copySprite(top)
bottom.y = 256 - 32
-- Ball
local ball = createSprite('⬤', 4, 96, 128)
ball.width = 16
ball.physics = true
-- Control Paddles
function drag(pos)
  local x = math.min(math.max(pos.x, 32), 192-32)
  if pos.y < 64 then
    top.x = x
  elseif pos.y > (256-64) then
    bottom.x = x 
  end
end
-- Score
top.score = 0
bottom.score = 0
local topScore = createSprite('', 12, 20, 4)
topScore.px = 0
topScore.py = 0
local bottomScore = createSprite('', 12, 192-20, 256-4)
bottomScore.px = 1
bottomScore.py = 1
-- Update score and reset ball
function newRound()
    topScore.char = tostring(top.score)
    bottomScore.char = tostring(bottom.score)
    ball.x = 96
    local dirY = math.random(0, 1)*2-1
    ball.y = 128-dirY*64
    ball.velY = dirY*3
    ball.velX = (math.random(0, 1)*2-1)*1.5
end
newRound()
-- Frame
function frame()
    if ball.y < 0 then
        top.score = top.score + 1
        newRound()
    end
    if ball.y > 256 then
        bottom.score = bottom.score + 1
        newRound()
    end
end`
let tiles: string = '{"dim":{"w":12,"h":16},"tileData":{"codePoint":[35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35,35,32,32,32,32,32,32,32,32,32,32,35],"color":[9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,1,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9]}}'
export default function (): Game {
    return new Game(script, TileMap.Copy(JSON.parse(tiles)));
}