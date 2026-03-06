import {Game} from './game'
import * as PPMd from "./compressor"
import { PatchMap, TileMap } from './tile';
import { stringToCodePoints } from './util';

export class Packer {
    #buffer: ArrayBuffer;
    #view: DataView;
    #offset: number;
    constructor() {
        this.#buffer = new ArrayBuffer(10240);
        this.#view = new DataView(this.#buffer);
        this.#offset = 0;
    }
    getUint8Array(): Uint8Array {
        return new Uint8Array(this.#buffer, 0, this.#offset);
    }
    packUint8(value: number): void {
        this.#view.setUint8(this.#offset, value);
        this.#offset += 1;
    }
    packUint16(value: number): void {
        this.#view.setUint16(this.#offset, value);
        this.#offset += 2;
    }
    packString(value: string): void {
        const encoded = new TextEncoder().encode(value);
        this.packUint8Array(encoded);
    }
    packUint8Array(value: Uint8Array): void {
        value = PPMd.compress(value);
        this.packUint16(value.byteLength);
        for (const val of value) {
            this.packUint8(val);
        }
    }
}

export class Unpacker {
    #view: DataView;
    #offset: number;
    constructor(data: Uint8Array) {
        this.#view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.#offset = 0;
    }
    unpackUint8(): number {
        const value = this.#view.getUint8(this.#offset);
        this.#offset += 1;
        return value;
    }
    unpackUint16(): number {
        const value = this.#view.getUint16(this.#offset);
        this.#offset += 2;
        return value;
    }
    unpackString(): string {
        const value = this.unpackUint8Array();
        return new TextDecoder().decode(value);
    }
    unpackUint8Array(): Uint8Array {
        const byteLength = this.unpackUint16();
        let value = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
            value[i] = this.unpackUint8();
        }
        return PPMd.decompress(value);
    }
}

// Import/Export
// https://stackoverflow.com/a/12713326
export function urlToData(): Uint8Array | null {
    const params = new URLSearchParams(window.location.search);
    const base64 = params.get("s");
    if (base64 === null) return null;
    const compressed = Uint8Array.from(atob(base64), (m) => m.codePointAt(0) ?? 0);
    if (compressed.length === 0) return null;
    return compressed;
}
export function dataToUrl(data: Uint8Array, page: string) {
    const base64 = btoa(Array.from(data, (byte) => String.fromCodePoint(byte)).join(""));
    const params = new URLSearchParams();
    params.set("s", base64);
    return URL.parse(page, window.location.origin+window.location.pathname)+"?"+params;
}

export function packGame(game: Game): Uint8Array {
    const packer = new Packer();
    // Script
    packer.packString(game.script);
    // Tilemap
    packer.packUint16(game.tileMap.dim.w);
    packer.packUint16(game.tileMap.dim.h);
    packer.packUint16(game.tileMap.count);
    const codePoints = [];
    const colors = [];
    for(const data of game.tileMap.tileData) {
        codePoints.push(...data.codePoint);
        colors.push(...data.color);
    }
    packer.packString(String.fromCodePoint(...codePoints));
    packer.packUint8Array(Uint8Array.from(colors));
    // Patch Map
    packer.packUint16(game.patchMap.dim.w);
    packer.packUint16(game.patchMap.dim.h);
    packer.packUint8Array(Uint8Array.from(game.patchMap.tileData.patchId));
    packer.packUint8Array(Uint8Array.from(game.patchMap.tileData.transform));
    // Solid Tiles
    packer.packString(String.fromCodePoint(...game.solidTiles));
    return packer.getUint8Array();
}

export function unpackGame(data: Uint8Array): Game {
    const unpacker = new Unpacker(data);
    // Script
    const script = unpacker.unpackString();
    // Tilemap
    const tileMapDimW = unpacker.unpackUint16();
    const tileMapDimH = unpacker.unpackUint16();
    const tileMapCount = unpacker.unpackUint16();
    const tileMapCodePoints = stringToCodePoints(unpacker.unpackString());
    const tileMapColors = unpacker.unpackUint8Array();
    const tileMap = new TileMap({w: tileMapDimW, h: tileMapDimH}, tileMapCount);
    const patchSize = tileMapDimW * tileMapDimH;
    for(let p = 0; p < tileMapCount; p++) {
        tileMap.tileData[p].codePoint = tileMapCodePoints.slice(patchSize * p, patchSize * (p + 1));
        tileMap.tileData[p].color = [...tileMapColors.slice(patchSize * p, patchSize * (p + 1))];
    }
    // Patch Map
    const patchMapDimW = unpacker.unpackUint16();
    const patchMapDimH = unpacker.unpackUint16();
    const patchMapPatchIds = unpacker.unpackUint8Array();
    const patchMapTransforms = unpacker.unpackUint8Array();
    const patchMap = new PatchMap({w: patchMapDimW, h: patchMapDimH});
    patchMap.tileData.patchId = [...patchMapPatchIds];
    patchMap.tileData.transform = [...patchMapTransforms];
    // Solid tiles
    const tileMapSolidTiles = unpacker.unpackString();
    let game = new Game(script, tileMap, patchMap);
    game.solidTiles = stringToCodePoints(tileMapSolidTiles);
    return game;
}

export function urlToGame() {
    let urlData = urlToData();
    if (urlData === null) {
        return new Game();
    }
    return unpackGame(urlData);
}
export function gameToUrl(game: Game, page = "play") {
    return dataToUrl(packGame(game), page);
}