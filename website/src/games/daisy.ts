import { Game } from "../game";
import { TileMap } from "../tile";

let script = `
local sprites = {}

local chars = "🚲🌹🌷⚘🚲🌹🌷⚘"
local color = {1, 2, 7, 4, 1, 2, 7, 4}
local i = 1
for _, c in utf8.codes(chars) do
  sprites[i] = createSprite(utf8.char(c), color[i], 0, 0)
  i = i + 1
end

createSprite("👫", 4, 96, 128)

local seconds = 0
function frame()
  for i = 1, 8 do
    local r = 6.28 / 8 * i
    sprites[i].x = math.sin(seconds+r) * 60 + 96
    sprites[i].y = math.cos(seconds+r) * 60 + 128
  end
  seconds = seconds + FRAME_TIME
end

say([[
There is a flower within my heart, Daisy, Daisy!
Planted one day by a glancing dart,
Planted by Daisy Bell!
Whether she loves me or loves me not,
Sometimes it's hard to tell;
Yet I am longing to share the lot
Of beautiful Daisy Bell!

Daisy, Daisy,
Give me your answer, do!
I'm half crazy,
All for the love of you!
It won't be a stylish marriage,
I can't afford a carriage,
But you'll look sweet upon the seat
Of a bicycle built for two!

We will go tandem as man and wife, Daisy, Daisy!
Pedaling away down the road of life,
I and my Daisy Bell!
When the road's dark we can both despise
Policeman and lamps as well;
There are bright lights in the dazzling eyes
Of beautiful Daisy Bell!

I will stand by you in wheel or woe, Daisy, Daisy!
You'll be the bell which I'll ring you know!
Sweet little Daisy Bell!
You'll take the lead in each trip we take,
Then if I don't do well;
I will permit you to use the brake,
My beautiful Daisy Bell!
]])`
export default function (): Game {
    return new Game(script);
}