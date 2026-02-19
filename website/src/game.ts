import { TileMap } from "./tile";

export class Game {
    script: string;
    tileMap: TileMap;
    constructor(script: string = "", tileMap: TileMap | null = null) {
        this.script = script;
        this.tileMap = tileMap ? TileMap.Copy(tileMap) : new TileMap({w: 12, h: 16});
    }
    toData() {
        return new TextEncoder().encode(JSON.stringify(this));
    }
    static fromData(data: AllowSharedBufferSource) {
        if (data === null) return new Game();
        const string = new TextDecoder().decode(data);
        if (string.length === 0) return new Game();
        const parsed = JSON.parse(string);
        return new Game(parsed.script, parsed.tileMap);
    }
}