import { TileMap } from "./tile";

export class Game {
    script: string;
    tileMap: TileMap;
    constructor(script: string = "", tileMap: TileMap | null = null) {
        this.script = script;
        this.tileMap = tileMap ? TileMap.Copy(tileMap) : new TileMap({w: 12, h: 16});
    }
}