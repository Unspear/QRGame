import { Game } from "../game";
import { TileMap } from "../tile";
let script: string = `function frame()
  camera.x = camera.x + FRAME_TIME * 30
  if camera.x > 16 * 16 then
    camera.x = camera.x - 16 * 16
  end
end`;
let tiles: string = `{"tileMap":{"dim":{"w":4,"h":4},"count":4,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[12,12,12,12,12,10,10,12,12,10,10,12,12,12,12,12]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[9,9,9,9,9,8,8,9,9,8,8,9,9,9,9,9]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[13,13,13,13,13,14,14,13,13,14,14,13,13,13,13,13]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[15,15,15,15,15,11,11,15,15,11,11,15,15,15,15,15]}]},"patchMap":{"dim":{"w":12,"h":4},"tileData":{"patchId":[0,1,2,3,0,1,2,3,0,1,2,3,1,2,3,0,1,2,3,0,1,2,3,0,2,3,0,1,2,3,0,1,2,3,0,1,3,0,1,2,3,0,1,2,3,0,1,2],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}`;
export default function (): Game {
    let parsed = JSON.parse(tiles);
    return new Game(script, parsed.tileMap, parsed.patchMap);
}