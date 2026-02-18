import charRenderer from './render.js'
import { CHAR_WIDTH, PALETTE } from './constants';
import Matter from 'matter-js'

/**
TileMap: An arragement of tiles (referenced from a TileSet). Does NOT have an inherent position.
- Dimensions
- Tile data array
- TileSet? (if null, the default tileset is just all the tiles in the sprite sheet)
TileSet: but a tileset can also contain a TileMap which
- TileMap
 */

export class TileMap {
    constructor(dim) {
        this.dim = dim;
        this.tileData = {
            codePoint: new Array(dim.w * dim.h).fill(' '.codePointAt(0)),
            color: new Array(dim.w * dim.h,).fill(0)
        };
    }
    static Copy(tileMap) {
        let copied = new TileMap(tileMap.dim);
        copied.tileData = structuredClone(tileMap.tileData);
        return copied;
    }
    setTile(coords, newTileData) {
        if (coords.x >= 0 && coords.x < this.dim.w && coords.y >= 0 && coords.y < this.dim.h)
        {
            const index = coords.y * this.dim.w + coords.x;
            if (Object.hasOwn(newTileData, "codePoint")) {
                this.tileData.codePoint[index] = newTileData.codePoint;
            }
            if (Object.hasOwn(newTileData, "color")) {
                this.tileData.color[index] = newTileData.color;
            }
        }
    }
    draw(ctx, viewPos = {x: 0, y: 0}, viewDim = {w: 12, h: 16}) {
        let codePoints = [];
        let colors = [];
        for (let y = viewPos.y; y < (viewPos.y + viewDim.h); y++) {
            for (let x = viewPos.x; x < (viewPos.x + viewDim.w); x++) {
                if (x < 0 || x >= this.dim.w || y < 0 || y >= this.dim.h) {
                    codePoints.push(32);
                    colors.push(0);
                } else {
                    const index = y * this.dim.w + x;
                    codePoints.push(this.tileData.codePoint[index]);
                    colors.push(this.tileData.color[index]);
                }
            }
        }
        charRenderer.draw(ctx, codePoints, colors, 0, 0, 0, 0, viewDim.w, false);
    }
}

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
}