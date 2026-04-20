import { Game } from "../game";

let script = `
local sprites = {}

local chars = "🚲🌹🌷⚘🚲🌹🌷⚘"
local color = {1, 2, 7, 4, 1, 2, 7, 4}
local i = 1
for _, c in utf8.codes(chars) do
  sprites[i] = createEntity(utf8.char(c), color[i], 0, 0)
  i = i + 1
end

createEntity("👫", 4, 96, 128)

local seconds = 0
function onUpdate()
  for i = 1, 8 do
    local r = 6.28 / 8 * i
    sprites[i].pos.x = math.sin(seconds+r) * 60 + 96
    sprites[i].pos.y = math.cos(seconds+r) * 60 + 128
  end
  seconds = seconds + DELTA_TIME
end

audio.speech([[
Daisy, Daisy,
Give me your answer, do!
I'm half crazy,
All for the love of you!
It won't be a stylish marriage,
I can't afford a carriage,
But you'll look sweet upon the seat
Of a bicycle built for two!
]]).output()`
export default function (): Game {
    return new Game({ title: "Daisy Bell", description: "A demo showing text-to-speech and sprite manipulation" }, script);
}