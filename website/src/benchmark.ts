import * as fflate from 'fflate'
import brotliPromise from 'brotli-wasm';
const brotli = await brotliPromise;
import * as PPMd from "./compressor"
import { Game } from './game';

const LUA_KEYWORDS = `andbreakdoelseelseifendfalseforfunctionifinlocalnilnotorrepeatreturnthentrueuntilwhile`;

class StreamCompressor {
    constructor(algorithm: CompressionFormat) {
        this.#algorithm = algorithm;
    }
    async compress(data: Uint8Array<ArrayBuffer>) {
        const stream = new Blob([data]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream(this.#algorithm));
        return await new Response(compressedStream).bytes();
    }
    async decompress(data: Uint8Array<ArrayBuffer>) {
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

export default async function(game: Game) {
        console.log(JSON.stringify(game));
        const gameData = game.toData();
        const results: Record<string, number> = {};
        results["raw"] = gameData.length;
        for (const c of compressors) {
            const compressed = await c.compress(gameData);
            results[c.toString()] = compressed.length;
        }
        const fflateOpts: fflate.DeflateOptions = {
            level: 9, 
            mem: 8
        };
        const fflateOptsDict: fflate.DeflateOptions = {
            level: 9,
            mem: 8,
            dictionary: new TextEncoder().encode(LUA_KEYWORDS)
        };
        results["fflate gzip"] = fflate.gzipSync(gameData, fflateOpts).length;
        results["fflate gzip w/dict"] = fflate.gzipSync(gameData, fflateOptsDict).length;
        results["fflate zlib"] = fflate.zlibSync(gameData, fflateOpts).length;
        results["fflate zlib w/dict"] = fflate.zlibSync(gameData, fflateOptsDict).length;
        results["fflate deflate"] = fflate.deflateSync(gameData, fflateOpts).length;
        results["fflate deflate w/dict"] = fflate.deflateSync(gameData, fflateOptsDict).length;
        results["brotli"] = brotli.compress(gameData, {quality: 11}).length;
        results["ppmd"] = PPMd.compress(gameData).length;
        console.table(results);
}