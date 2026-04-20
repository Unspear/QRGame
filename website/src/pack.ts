import {Game} from './game'
import * as PPMd from "./compressor"
import { PatchMap, TileMap } from './tile';
import { Marker, stringToCodePoints } from './util';

export type DataTransform = (array: Uint8Array) => Uint8Array;

export class Packer {
    #buffer: ArrayBuffer;
    #view: DataView;
    #offset: number;
    compressor: DataTransform;
    constructor(compressor: DataTransform) {
        this.#buffer = new ArrayBuffer(10240);
        this.#view = new DataView(this.#buffer);
        this.#offset = 0;
        this.compressor = compressor;
    }
    getUint8Array(): Uint8Array {
        return new Uint8Array(this.#buffer, 0, this.#offset);
    }
    packUint8(value: number): void {
        console.assert(256 > value && value >= 0);
        this.#view.setUint8(this.#offset, value);
        this.#offset += 1;
    }
    packUint16(value: number): void {
        console.assert(65536 > value && value >= 0);
        this.#view.setUint16(this.#offset, value);
        this.#offset += 2;
    }
    packUintVar(value: number): void {
        console.assert(value >= 0);
        do {
            let piece = value & 127;
            value = value >> 7;
            if (value > 0) {
                piece += 128;
            }
            this.packUint8(piece);
        } while (value > 0);
    }
    packString(value: string): void {
        const encoded = new TextEncoder().encode(value);
        this.packUint8Array(encoded);
    }
    packUint8Array(value: Uint8Array): void {
        value = this.compressor(value);
        this.packUintVar(value.byteLength);
        for (const val of value) {
            this.packUint8(val);
        }
    }
}

export class Unpacker {
    #view: DataView;
    #offset: number;
    decompressor: DataTransform;
    constructor(data: Uint8Array, decompressor: DataTransform) {
        this.#view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.#offset = 0;
        this.decompressor = decompressor;
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
    unpackUintVar(): number {
        let value = 0;
        let multiplier = 1;
        let piece = 0;
        do {
            piece = this.unpackUint8();
            value += (piece & 127) * multiplier;
            multiplier *= 128;
        } while(piece > 127);
        return value;
    }
    unpackString(): string {
        const value = this.unpackUint8Array();
        return new TextDecoder().decode(value);
    }
    unpackUint8Array(): Uint8Array {
        const byteLength = this.unpackUintVar();
        let value = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
            value[i] = this.unpackUint8();
        }
        return this.decompressor(value);
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

export function packGame(game: Game, compressor: DataTransform = PPMd.compress): Uint8Array {
    const packer = new Packer(compressor);
    // Info
    packer.packString(game.metadata.title);
    packer.packString(game.metadata.description);
    // Script
    packer.packString(game.script);
    // Tilemap
    packer.packUintVar(game.tileMap.dim.w);
    packer.packUintVar(game.tileMap.dim.h);
    packer.packUintVar(game.tileMap.count);
    const codePoints = [];
    const colours = [];
    for(const data of game.tileMap.tileData) {
        codePoints.push(...data.codePoint);
        colours.push(...data.colour);
    }
    packer.packString(String.fromCodePoint(...codePoints));
    packer.packUint8Array(Uint8Array.from(colours));
    // Patch Map
    packer.packUintVar(game.patchMap.dim.w);
    packer.packUintVar(game.patchMap.dim.h);
    packer.packUint8Array(Uint8Array.from(game.patchMap.tileData.patchId));
    packer.packUint8Array(Uint8Array.from(game.patchMap.tileData.transform));
    // Markers
    packer.packUintVar(game.markers.length);
    for (const marker of game.markers) {
        packer.packUintVar(marker.x);
        packer.packUintVar(marker.y);
        packer.packUintVar(marker.codePoint);
    }
    // Solid Tiles
    packer.packString(String.fromCodePoint(...game.solidTiles));
    return packer.getUint8Array();
}

export function unpackGame(data: Uint8Array, decompressor: DataTransform = PPMd.decompress): Game {
    const unpacker = new Unpacker(data, decompressor);
    // Info
    const infoTitle = unpacker.unpackString();
    const infoDescription = unpacker.unpackString();
    // Script
    const script = unpacker.unpackString();
    // Tilemap
    const tileMapDimW = unpacker.unpackUintVar();
    const tileMapDimH = unpacker.unpackUintVar();
    const tileMapCount = unpacker.unpackUintVar();
    const tileMapCodePoints = stringToCodePoints(unpacker.unpackString());
    const tileMapColours = unpacker.unpackUint8Array();
    const tileMap = new TileMap({w: tileMapDimW, h: tileMapDimH}, tileMapCount);
    const patchSize = tileMapDimW * tileMapDimH;
    for(let p = 0; p < tileMapCount; p++) {
        tileMap.tileData[p].codePoint = tileMapCodePoints.slice(patchSize * p, patchSize * (p + 1));
        tileMap.tileData[p].colour = [...tileMapColours.slice(patchSize * p, patchSize * (p + 1))];
    }
    // Patch Map
    const patchMapDimW = unpacker.unpackUintVar();
    const patchMapDimH = unpacker.unpackUintVar();
    const patchMapPatchIds = unpacker.unpackUint8Array();
    const patchMapTransforms = unpacker.unpackUint8Array();
    const patchMap = new PatchMap({w: patchMapDimW, h: patchMapDimH});
    patchMap.tileData.patchId = [...patchMapPatchIds];
    patchMap.tileData.transform = [...patchMapTransforms];
    // Markers
    const markerLength = unpacker.unpackUintVar();
    const markers: Marker[] = [];
    for (let i = 0; i < markerLength; i++) {
        markers.push({
            x: unpacker.unpackUintVar(),
            y: unpacker.unpackUintVar(),
            codePoint: unpacker.unpackUintVar(),
        });
    }
    // Solid tiles
    const tileMapSolidTiles = unpacker.unpackString();
    let game = new Game({title: infoTitle, description: infoDescription}, script, tileMap, patchMap);
    game.markers = markers;
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