import Matter from 'matter-js';
import charRenderer from './render'
import { Dimensions, Point } from './util';
import { CHAR_WIDTH } from './constants';

/**
TileMap: An arragement of tiles (referenced from a TileSet). Does NOT have an inherent position.
- Dimensions
- Tile data array
- TileSet? (if null, the default tileset is just all the tiles in the sprite sheet)
TileSet: but a tileset can also contain a TileMap which
- TileMap
 */

type SingleTileData = {
    codePoint: number;
    color: number;
}

export class TileMap {
    dim: Dimensions;
    solidTiles: number[];
    tileData: {
        codePoint: number[],
        color: number[]
    };
    constructor(dim: Dimensions) {
        this.dim = dim;
        this.tileData = {
            codePoint: new Array(dim.w * dim.h).fill(' '.codePointAt(0)),
            color: new Array(dim.w * dim.h,).fill(0)
        };
        this.solidTiles = [];
    }
    static Copy(tileMap: TileMap): TileMap {
        let copied = new TileMap(tileMap.dim);
        if (tileMap.tileData !== undefined) {
            copied.tileData = structuredClone(tileMap.tileData);
        }
        if (tileMap.solidTiles !== undefined) {
            copied.solidTiles = structuredClone(tileMap.solidTiles);
        }
        return copied;
    }
    getIndex(coords: Point): number | null {
        if (coords.x >= 0 && coords.x < this.dim.w && coords.y >= 0 && coords.y < this.dim.h)
        {
            return coords.y * this.dim.w + coords.x;
        }
        return null;
    }
    getTile(coords: Point): SingleTileData | null {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return null;
        }
        return {codePoint: this.tileData.codePoint[index], color: this.tileData.color[index]};
    }
    setTile(coords: Point, newTileData: SingleTileData) {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return;
        }
        if (newTileData.codePoint !== undefined) {
            this.tileData.codePoint[index] = newTileData.codePoint;
        }
        if (newTileData.color !== undefined) {
            this.tileData.color[index] = newTileData.color;
        }
    }
    draw(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        charRenderer.draw(ctx, this.tileData.codePoint, this.tileData.color, viewOffset.x, viewOffset.y, 0, 0, this.dim.w, false);
    }
    createBodies(matterEngine: Matter.Engine) {
        const options = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 0.0,
            isStatic: true
        };
        for (let y = 0; y < this.dim.h; y++) {
            for (let x = 0; x < this.dim.w; x++) {
                const tile: SingleTileData = this.getTile({x: x, y: y})!;
                if (this.solidTiles.includes(tile.codePoint)) {
                    const physBody = Matter.Bodies.rectangle((x + 0.5) * CHAR_WIDTH, (y + 0.5) * CHAR_WIDTH, CHAR_WIDTH, CHAR_WIDTH, options);
                    Matter.Composite.add(matterEngine.world, physBody);
                }
            }
        }
    }
    /*getPaethPrediction(data: number[], x: number, y: number): number {
        if (y > 0) {
            if (x > 0){// Full Paeth
                const n = data[this.getIndex(x, y - 1)];
                const e = data[this.getIndex(x - 1, y)];
                const ne = data[this.getIndex(x - 1, y - 1)];
                if (n === ne) {
                    return e;
                }
                if (e === ne) {
                    return n;
                }
                return ne;
            }
            else {// Only north
                return data[this.getIndex(x, y - 1)];
            }
        }
        else {
            if (x > 0){// Only east
                return data[this.getIndex(x - 1, y)];
            }
            else {// First value, so no prediction is possible, 0 is the best guess we can make
                return 0;
            }
        }
    }
    paethEncode(data: number[], paethValue: number): number[] {
        let encoded: number[] = [];
        let usedPaeth = 0;
        for (let y = 0; y < this.dim.h; y++) {
            for (let x = 0; x < this.dim.w; x++) {
                const value = data[this.getIndex(x, y)];
                const prediction = this.getPaethPrediction(data, x, y);
                if (value === prediction) {
                    encoded.push(paethValue);
                    usedPaeth += 1;
                }
                else
                {
                    encoded.push(value);
                }
            }
        }
        console.log('used prediction: %d out of %d', usedPaeth, encoded.length);
        return encoded;
    }
    paethDecode(encoded: number[], paethValue: number): number[] {
        let decoded: number[] = [];
        for (let y = 0; y < this.dim.h; y++) {
            for (let x = 0; x < this.dim.w; x++) {
                const value = encoded[this.getIndex(x, y)];
                if (value === paethValue) {
                    decoded.push(this.getPaethPrediction(decoded, x, y));
                }
                else
                {
                    decoded.push(value);
                }
            }
        }
        return decoded;
    }
    // 1 in unicode is an unused control character
    // Hypothetically someone could shove it into the tiledata
    // but if they did it would just be replaced by a predicted character, not break anything
    static PAETH_VALUE_CODE_POINT: number = 1;
    // There are 8 colors plus another 8 for inversions so 16 is the first unused index
    static PAETH_VALUE_COLOR: number = 16;*/
}
/**
export class MetaTileMap {
    constructor(dim, tileSet) {
        this.dim = dim;
        this.tiles = new Array(dim.w * dim.h).fill({tileId: 0, transform: 0 });
        this.tileSet = tileSet;
    }
    setTile(coords, tileId, transform) {
        let tile = this.tiles[coords.y * this.dim.w + coords.x];
        tile.tileId = tileId;
        tile.transform = transform;
    }
    getTileMap() {
    }
}

export class TileSet {
    constructor(count, dim, tileSet) {
        this.tiles = {};
    }
} */