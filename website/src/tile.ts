import charRenderer from './render'
import { Dimensions, Point } from './util';

/**
TileMap: An arragement of tiles (referenced from a TileSet). Does NOT have an inherent position.
- Dimensions
- Tile data array
- TileSet? (if null, the default tileset is just all the tiles in the sprite sheet)
TileSet: but a tileset can also contain a TileMap which
- TileMap
 */

type NewTileData = {
    codePoint?: number;
    color?: number;
}

export class TileMap {
    dim: Dimensions;
    tileData: {
        codePoint: number[],
        color: number[]
    }
    constructor(dim: Dimensions) {
        this.dim = dim;
        this.tileData = {
            codePoint: new Array(dim.w * dim.h).fill(' '.codePointAt(0)),
            color: new Array(dim.w * dim.h,).fill(0)
        };
    }
    static Copy(tileMap: TileMap) {
        let copied = new TileMap(tileMap.dim);
        copied.tileData = structuredClone(tileMap.tileData);
        return copied;
    }
    setTile(coords: Point, newTileData: NewTileData) {
        if (coords.x >= 0 && coords.x < this.dim.w && coords.y >= 0 && coords.y < this.dim.h)
        {
            const index = coords.y * this.dim.w + coords.x;
            if (newTileData.codePoint !== undefined) {
                this.tileData.codePoint[index] = newTileData.codePoint;
            }
            if (newTileData.color !== undefined) {
                this.tileData.color[index] = newTileData.color;
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        charRenderer.draw(ctx, this.tileData.codePoint, this.tileData.color, viewOffset.x, viewOffset.y, 0, 0, this.dim.w, false);
    }
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