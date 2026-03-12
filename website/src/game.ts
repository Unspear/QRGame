import { PatchMap, TileMap } from "./tile";

export class Game {
    metadata: {
        title: string;
        description: string;
    };
    script: string;
    tileMap: TileMap;
    patchMap: PatchMap;
    solidTiles: number[];
    constructor(metadata = { title: "Game", description: "An empty game" }, script: string = "", tileMap: TileMap | null = null, patchMap: PatchMap | null = null) {
        this.metadata = metadata;
        this.script = script;
        this.tileMap = tileMap ? TileMap.Copy(tileMap) : new TileMap({w: 12, h: 16});
        this.patchMap = patchMap ? PatchMap.Copy(patchMap) : new PatchMap({w: 1, h: 1});
        this.solidTiles = [];
    }
}