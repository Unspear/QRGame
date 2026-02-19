import {Game} from './game'
import * as PPMd from "./compressor"

// Import/Export
// https://stackoverflow.com/a/12713326
export function urlToData(): Uint8Array {
    const params = new URLSearchParams(window.location.search);
    const base64 = params.get("s");
    if (base64 === null) return null;
    const compressed = new Uint8Array(atob(base64).split("").map(function(c) { return c.charCodeAt(0); }));
    if (compressed.length === 0) return null;
    return compressed;
}
export function dataToUrl(data: Uint8Array, page: string) {
    const base64: string = btoa(String.fromCharCode.apply(null, data));
    const params = new URLSearchParams();
    params.set("s", base64);
    return URL.parse(page, window.location.origin+window.location.pathname)+"?"+params;
}
export function compressData(data: Uint8Array) {
    return PPMd.compress(data);
}
export function decompressData(data: Uint8Array) {
    if (data === null) return null;
    return PPMd.decompress(data);
}
export function urlToGame() {
    return Game.fromData(decompressData(urlToData()));
}
export function gameToUrl(game: Game, page = "play") {
    return dataToUrl(compressData(game.toData()), page);
}