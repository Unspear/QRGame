import Matter from 'matter-js';
import { Dimensions, Point } from './util';
import { CHAR_WIDTH } from './constants';
import { Renderer } from './render';

type SingleTileData = {
    codePoint: number;
    color: number;
}
type MultiTileData = {
    codePoint: number[],
    color: number[]
}

export class TileMap {
    dim: Dimensions;
    count: number;
    tileData: MultiTileData[];
    constructor(dim: Dimensions, count: number = 1) {
        this.dim = dim;
        this.count = count;
        this.tileData = []
        for(let i = 0; i < count; i++){
            this.tileData.push({
                codePoint: new Array(dim.w * dim.h).fill(' '.codePointAt(0)),
                color: new Array(dim.w * dim.h,).fill(0)
            });
        };
    }
    static Copy(tileMap: TileMap): TileMap {
        let copied = new TileMap(tileMap.dim, tileMap.count);// Default value is used automatically if 'tileMap.patchDim' is undefined
        if (tileMap.tileData !== undefined) {
            copied.tileData = structuredClone(tileMap.tileData);
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
    getTile(coords: Point, patchIndex: number = 0): SingleTileData | null {
        const index = this.getIndex(coords);
        if (index == null)
        {
            return null;
        }
        let patch = this.tileData[patchIndex];
        if (patch == null) {
            return null;
        }
        return {codePoint: patch.codePoint[index], color: patch.color[index]};
    }
    getSplitCoords(globalCoords: Point): {coords: Point, patchIndex: number} {
        return {
            coords: {
                x: globalCoords.x % this.dim.w,
                y: globalCoords.y
            },
            patchIndex: Math.floor(globalCoords.x / this.dim.w),
        }
    }
    setTile(newTileData: SingleTileData, coords: Point, patchIndex: number = 0) {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return;
        }
        let patch = this.tileData[patchIndex];
        if (patch === null) {
            return null;
        }
        patch.codePoint[index] = newTileData.codePoint;
        patch.color[index] = newTileData.color;
    }
    draw(renderer: Renderer, viewOffset: Point) {
        for (let i = 0; i < this.count; i++) {
            let patch = this.tileData[i]!;
            let offset = i * this.dim.w * CHAR_WIDTH;
            renderer.drawCharacters(patch.codePoint, patch.color, viewOffset.x + offset, viewOffset.y, 0, 0, this.dim.w, false);
        }
    }
    drawOutline(renderer: Renderer, viewOffset: Point) {
        for (let i = 0; i < this.count; i++) {
            let offset = i * this.dim.w * CHAR_WIDTH;
            const margin = 0.0;
            const x0 = offset + viewOffset.x - margin;
            const x1 = offset + viewOffset.x + this.dim.w * CHAR_WIDTH + margin;
            const y0 = viewOffset.y - margin;
            const y1 = viewOffset.y + this.dim.h * CHAR_WIDTH + margin;
            renderer.drawBox(x0, y0, x1, y1);
        }
    }
    createBodies(matterEngine: Matter.Engine, solidTiles: number[]) {
        const options = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 0.0,
            isStatic: true
        };
        for (let y = 0; y < this.dim.h; y++) {
            for (let x = 0; x < this.dim.w; x++) {
                const tile: SingleTileData = this.getTile({x: x, y: y})!;
                if (solidTiles.includes(tile.codePoint)) {
                    const physBody = Matter.Bodies.rectangle((x + 0.5) * CHAR_WIDTH, (y + 0.5) * CHAR_WIDTH, CHAR_WIDTH, CHAR_WIDTH, options);
                    Matter.Composite.add(matterEngine.world, physBody);
                }
            }
        }
    }
}

type SinglePatchData = {
    patchId: number;
    transform: number;
}
type MultiPatchData = {
    patchId: number[],
    transform: number[]
}

export class PatchMap {
    dim: Dimensions;
    tileData: MultiPatchData;
    constructor(dim: Dimensions) {
        this.dim = dim;
        this.tileData = {
            patchId: new Array(dim.w * dim.h).fill(0),
            transform: new Array(dim.w * dim.h,).fill(0)
        };
    }
    static Copy(patchMap: PatchMap): PatchMap {
        let copied = new PatchMap(patchMap.dim);
        if (patchMap.tileData !== undefined) {
            copied.tileData = structuredClone(patchMap.tileData);
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
    getPatch(coords: Point): SinglePatchData | null {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return null;
        }
        return {patchId: this.tileData.patchId[index], transform: this.tileData.transform[index]};
    }
    setPatch(newTileData: SinglePatchData, coords: Point) {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return;
        }
        this.tileData.patchId[index] = newTileData.patchId;
        this.tileData.transform[index] = newTileData.transform;
    }
    getPatchDrawOffset(patchCoords: Point): Point {
        return {
            x: patchCoords.x * (this.dim.w + 1) * CHAR_WIDTH,
            y: patchCoords.y * (this.dim.h + 1) * CHAR_WIDTH,
        }
    }
    draw(renderer: Renderer, viewOffset: Point) {
        renderer.drawCharacters(this.tileData.patchId.map(n => n + 0x30/**use ABCD etc. to represent patchIds*/), new Array(this.tileData.patchId.length).fill(0), viewOffset.x, viewOffset.y, 0, 0, this.dim.w, false);
    }
    drawOutline(renderer: Renderer, viewOffset: Point) {
        const margin = 0;
        const x0 = viewOffset.x - margin;
        const x1 = viewOffset.x + this.dim.w * CHAR_WIDTH + margin;
        const y0 = viewOffset.y - margin;
        const y1 = viewOffset.y + this.dim.h * CHAR_WIDTH + margin;
        renderer.drawBox(x0, y0, x1, y1);
    }
    createTileMap(patchSource: TileMap): TileMap {
        let tileMap = new TileMap({w: patchSource.dim.w * this.dim.w, h: patchSource.dim.h * this.dim.h});
        // Iterate patches
        for (let outerX = 0; outerX < this.dim.w; outerX++) {
            for (let outerY = 0; outerY < this.dim.h; outerY++) {
                let offsetX = outerX * patchSource.dim.w;
                let offsetY = outerY * patchSource.dim.h;
                let patchIndex = this.getPatch({x: outerX, y: outerY})!.patchId;
                // Iterate tiles in patch
                for (let innerX = 0; innerX < patchSource.dim.w; innerX++) {
                    for (let innerY = 0; innerY < patchSource.dim.h; innerY++) {
                        tileMap.setTile(patchSource.getTile({x: innerX, y: innerY}, patchIndex)!, {x: innerX + offsetX, y: innerY + offsetY});
                    }
                }
            }
        }
        return tileMap
    }
}