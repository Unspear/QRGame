import { PatchMap, TileMap } from "./tile";

export class Game {
    script: string;
    tileMap: TileMap;
    patchMap: PatchMap;
    solidTiles: number[];
    constructor(script: string = "", tileMap: TileMap | null = null, patchMap: PatchMap | null = null) {
        this.script = script;
        this.tileMap = tileMap ? TileMap.Copy(tileMap) : new TileMap({w: 12, h: 16});
        this.patchMap = patchMap ? PatchMap.Copy(patchMap) : new PatchMap({w: 1, h: 1});
        this.solidTiles = [];
    }
}