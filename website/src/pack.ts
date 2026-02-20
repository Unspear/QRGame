import {Game} from './game'
import * as PPMd from "./compressor"

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
export function compressData(data: Uint8Array): Uint8Array {
    return PPMd.compress(data);
}
export function decompressData(data: Uint8Array): Uint8Array {
    return PPMd.decompress(data);
}
export function urlToGame() {
    let urlData = urlToData();
    if (urlData === null) {
        return new Game();
    }
    return Game.fromData(decompressData(urlData));
}
export function gameToUrl(game: Game, page = "play") {
    return dataToUrl(compressData(game.toData()), page);
}