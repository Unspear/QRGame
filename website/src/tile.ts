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
    draw(renderer: Renderer, isEditor: boolean = false) {
        for (let i = 0; i < this.count; i++) {
            this.drawSingle(renderer, i, {x: i * this.dim.w * CHAR_WIDTH, y: 0 });
        }
        if (isEditor) {
            renderer.drawGrid(0, 0, this.dim.w * CHAR_WIDTH * this.count, this.dim.h * CHAR_WIDTH, this.dim.w * this.count, this.dim.h);
            for (let i = 0; i < this.count; i++) {
                let offset = i * this.dim.w * CHAR_WIDTH;
                renderer.drawBox(offset, 0, offset + this.dim.w * CHAR_WIDTH, this.dim.h * CHAR_WIDTH, -1.5);
            }
        }
    }
    drawSingle(renderer: Renderer, index: number, point: Point) {
        let patch = this.tileData[index]!;
        renderer.drawCharacters(patch.codePoint, patch.color, point.x, point.y, 0, 0, this.dim.w, false, false);
    }
    getDrawDim(): Dimensions {
        return {
            w: this.count * this.dim.w * CHAR_WIDTH,
            h: this.dim.h * CHAR_WIDTH
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
    draw(renderer: Renderer, patchSource: TileMap, isEditor: boolean = false) {
        for (let patchX = 0; patchX < this.dim.w; patchX++) {
            for (let patchY = 0; patchY < this.dim.h; patchY++) {
                const index = this.getIndex({x: patchX, y: patchY})!;
                const patchId = this.tileData.patchId[index];
                patchSource.drawSingle(renderer, patchId, { x: patchX * patchSource.dim.w * CHAR_WIDTH, y: patchY * patchSource.dim.h * CHAR_WIDTH});
            }
        }
        if (isEditor) {
            renderer.drawGrid(0, 0, patchSource.dim.w * this.dim.w * CHAR_WIDTH, patchSource.dim.h * this.dim.h * CHAR_WIDTH, this.dim.w, this.dim.h);
            renderer.drawBox(0, 0, patchSource.dim.w * this.dim.w * CHAR_WIDTH, patchSource.dim.h * this.dim.h * CHAR_WIDTH, -1.5);
        }
        //use ABCD etc. to represent patchIds
        /*renderer.drawCharacters(this.tileData.patchId.map(n => n + 0x30), new Array(this.tileData.patchId.length).fill(0), 0, 0, 0, 0, this.dim.w, false);
        if (isEditor) {
            renderer.drawGrid(0, 0, this.dim.w * CHAR_WIDTH, this.dim.h * CHAR_WIDTH, this.dim.w, this.dim.h);
            renderer.drawBox(0, 0, this.dim.w * CHAR_WIDTH, this.dim.h * CHAR_WIDTH, -1.5);
        }*/
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
    getDrawDim(patchSource: TileMap): Dimensions {
        return {
            w: this.dim.w * patchSource.dim.w * CHAR_WIDTH,
            h: this.dim.h * patchSource.dim.h * CHAR_WIDTH
        }
    }
}