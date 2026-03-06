import Matter from 'matter-js';
import charRenderer from './render'
import { Dimensions, Point } from './util';
import { CHAR_WIDTH } from './constants';

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
    patchDim: Dimensions;
    tileData: MultiTileData[];
    constructor(dim: Dimensions, patchDim: Dimensions = {w: 1, h: 1}) {
        this.dim = dim;
        this.patchDim = patchDim;
        this.tileData = []
        for(let i = 0; i < patchDim.w * patchDim.h; i++){
            this.tileData.push({
                codePoint: new Array(dim.w * dim.h).fill(' '.codePointAt(0)),
                color: new Array(dim.w * dim.h,).fill(0)
            });
        };
    }
    static Copy(tileMap: TileMap): TileMap {
        let copied = new TileMap(tileMap.dim, tileMap.patchDim);// Default value is used automatically if 'tileMap.patchDim' is undefined
        if (tileMap.tileData !== undefined) {
            copied.tileData = structuredClone(tileMap.tileData);
        }
        return copied;
    }
    getPatchIndex(coords: Point): number | null {
        if (coords.x >= 0 && coords.x < this.patchDim.w && coords.y >= 0 && coords.y < this.patchDim.h)
        {
            return coords.y * this.patchDim.w + coords.x;
        }
        return null;
    }
    getIndex(coords: Point): number | null {
        if (coords.x >= 0 && coords.x < this.dim.w && coords.y >= 0 && coords.y < this.dim.h)
        {
            return coords.y * this.dim.w + coords.x;
        }
        return null;
    }
    getPatch(coords: Point): MultiTileData | null {
        const index = this.getPatchIndex(coords);
        if (index === null)
        {
            return null;
        }
        return this.tileData[index];
    }
    getTile(coords: Point, patchCoords: Point = {x: 0, y: 0}): SingleTileData | null {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return null;
        }
        let patch = this.getPatch(patchCoords);
        if (patch === null) {
            return null;
        }
        return {codePoint: patch.codePoint[index], color: patch.color[index]};
    }
    getSplitCoords(globalCoords: Point): {coords: Point, patchCoords: Point} {
        return {
            coords: {
                x: globalCoords.x % this.dim.w,
                y: globalCoords.y % this.dim.h
            },
            patchCoords: {
                x: Math.floor(globalCoords.x / this.dim.w),
                y: Math.floor(globalCoords.y / this.dim.h)
            },
        }
    }
    setTile(newTileData: SingleTileData, coords: Point, patchCoords: Point = {x: 0, y: 0}) {
        const index = this.getIndex(coords);
        if (index === null)
        {
            return;
        }
        let patch = this.getPatch(patchCoords);
        if (patch === null) {
            return;
        }
        patch.codePoint[index] = newTileData.codePoint;
        patch.color[index] = newTileData.color;
    }
    getPatchDrawOffset(patchCoords: Point): Point {
        return {
            x: patchCoords.x * this.dim.w * CHAR_WIDTH,
            y: patchCoords.y * this.dim.h * CHAR_WIDTH,
        }
    }
    draw(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        for (let patchX = 0; patchX < this.patchDim.w; patchX++) {
            for (let patchY = 0; patchY < this.patchDim.h; patchY++) {
                let patchCoords = { x: patchX, y: patchY };
                let patch = this.getPatch(patchCoords)!;
                let offset = this.getPatchDrawOffset(patchCoords);
                charRenderer.draw(ctx, patch.codePoint, patch.color, viewOffset.x + offset.x, viewOffset.y + offset.y, 0, 0, this.dim.w, false);
            }
        }
    }
    drawOutline(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        for (let patchX = 0; patchX < this.patchDim.w; patchX++) {
            for (let patchY = 0; patchY < this.patchDim.h; patchY++) {
                let patchCoords = { x: patchX, y: patchY };
                let offset = this.getPatchDrawOffset(patchCoords);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'aquamarine';
                ctx.lineDashOffset = 0.5;
                ctx.setLineDash([6, 2]);
                ctx.beginPath();
                const margin = 0.0;
                const x0 = offset.x + viewOffset.x - margin;
                const x1 = offset.x + viewOffset.x + this.dim.w * CHAR_WIDTH + margin;
                const y0 = offset.y + viewOffset.y - margin;
                const y1 = offset.y + viewOffset.y + this.dim.h * CHAR_WIDTH + margin;
                ctx.lineTo(x0, y0);
                ctx.lineTo(x1, y0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x0, y1);
                ctx.closePath();
                ctx.stroke();
            }
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
    draw(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        charRenderer.draw(ctx, this.tileData.patchId.map(n => n + 0x41/**use ABCD etc. to represent patchIds*/), new Array(this.tileData.patchId.length).fill(0), viewOffset.x, viewOffset.y, 0, 0, this.dim.w, false);
    }
    drawOutline(ctx: CanvasRenderingContext2D, viewOffset: Point) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'aquamarine';
        ctx.lineDashOffset = 0.5;
        ctx.setLineDash([6, 2]);
        ctx.beginPath();
        const margin = 0;
        const x0 = viewOffset.x - margin;
        const x1 = viewOffset.x + this.dim.w * CHAR_WIDTH + margin;
        const y0 = viewOffset.y - margin;
        const y1 = viewOffset.y + this.dim.h * CHAR_WIDTH + margin;
        ctx.lineTo(x0, y0);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x0, y1);
        ctx.closePath();
        ctx.stroke();
    }
}