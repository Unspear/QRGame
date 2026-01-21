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
        this.tiles = Array(dim.w * dim.h).fill({codePoint: ' '.codePointAt(0), colorId: 0 });
    }
    setTile(coords, codePoint, colorId) {
        let tile = this.tiles[coords.y * this.dim.w + coords.x];
        tile.codePoint = codePoint;
        tile.colorId = colorId;
    }
}

export class MetaTileMap {
    constructor(dim, tileSet) {
        this.dim = dim;
        this.tiles = Array(dim.w * dim.h).fill({tileId: 0, transform: 0 });
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