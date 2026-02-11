import {Game} from './game.js'
import * as PPMd from "./compressor.js"

// Import/Export
export function urlToData() {
    const params = new URLSearchParams(window.location.search);
    const base64 = params.get("s");
    if (base64 === null) return null;
    const compressed = Uint8Array.fromBase64(base64, { alphabet: "base64url", omitPadding: true });
    if (compressed.length === 0) return null;
    return compressed;
}
export function dataToUrl(data) {
    const base64 = data.toBase64({ alphabet: "base64url", omitPadding: true });
    const params = new URLSearchParams();
    params.set("s", base64);
    return URL.parse("play", window.location.origin+window.location.pathname)+"?"+params;
}
export function compressData(data) {
    return PPMd.compress(data);
}
export function decompressData(data) {
    if (data === null) return null;
    return PPMd.decompress(data);
}
export function urlToGame() {
    return Game.fromData(decompressData(urlToData()));
}
export function gameToUrl(game) {
    return dataToUrl(compressData(game.toData()));
}