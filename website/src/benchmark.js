import * as fflate from 'fflate'
import brotliPromise from 'brotli-wasm';
const brotli = await brotliPromise;

const LUA_KEYWORDS = `andbreakdoelseelseifendfalseforfunctionifinlocalnilnotorrepeatreturnthentrueuntilwhile`;

class StreamCompressor {
    constructor(algorithm) {
        this.#algorithm = algorithm;
    }
    async compress(data) {
        const stream = new Blob([data]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream(this.#algorithm));
        return await new Response(compressedStream).bytes();
    }
    async decompress(data) {
        const stream = new Blob([data]).stream();
        const decompressedStream = stream.pipeThrough(new DecompressionStream(this.#algorithm));
        return await new Response(decompressedStream).bytes();
    }
    toString() {
        return "web " + this.#algorithm;
    }
    #algorithm
}

const compressors = [
    new StreamCompressor("deflate-raw"),
    new StreamCompressor("gzip"),
    new StreamCompressor("deflate"),
];

export default async function(game) {
        console.log(JSON.stringify(game));
        const gameData = game.toData();
        const results = {};
        results["raw"] = gameData.length;
        for (const c of compressors) {
            const compressed = await c.compress(gameData);
            results[c.toString()] = compressed.length;
        }
        const fflateOpts = {level: 9, mem: 8};
        const fflateOptsDict = {level: 9, mem: 8, dictionary: new TextEncoder().encode(LUA_KEYWORDS)};
        results["fflate gzip"] = fflate.gzipSync(gameData, fflateOpts).length;
        results["fflate gzip w/dict"] = fflate.gzipSync(gameData, fflateOptsDict).length;
        results["fflate zip"] = fflate.zipSync(gameData, fflateOpts).length;
        results["fflate zip w/dict"] = fflate.zipSync(gameData, fflateOptsDict).length;
        results["fflate zlib"] = fflate.zlibSync(gameData, fflateOpts).length;
        results["fflate zlib w/dict"] = fflate.zlibSync(gameData, fflateOptsDict).length;
        results["fflate deflate"] = fflate.deflateSync(gameData, fflateOpts).length;
        results["fflate deflate w/dict"] = fflate.deflateSync(gameData, fflateOptsDict).length;
        results["brotli"] = brotli.compress(gameData, {quality: 11}).length;
        console.table(results);
}