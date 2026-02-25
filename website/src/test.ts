import './style.css';
import './pwa'
import library from './library'
import * as fflate from 'fflate'
import brotliPromise from 'brotli-wasm';
const brotli = await brotliPromise;
import * as PPMd from "./compressor"
import { Game } from './game';
import { packGame } from './pack';

const LUA_KEYWORDS = `andbreakdoelseelseifendfalseforfunctionifinlocalnilnotorrepeatreturnthentrueuntilwhile`;

function basicGameToData(game: Game): Uint8Array<ArrayBuffer> {
    return new TextEncoder().encode(JSON.stringify(game));
}

function basicGameFromData(data: AllowSharedBufferSource): Game {
    if (data === null) return new Game();
    const string = new TextDecoder().decode(data);
    if (string.length === 0) return new Game();
    const parsed = JSON.parse(string);
    return new Game(parsed.script, parsed.tileMap);
}

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

const fflateOpts: fflate.DeflateOptions = {
    level: 9, 
    mem: 8
};
const fflateOptsDict: fflate.DeflateOptions = {
    level: 9,
    mem: 8,
    dictionary: new TextEncoder().encode(LUA_KEYWORDS)
};

async function benchmarkGame(game: Game): Promise<readonly [string, number][]> {
        //console.log(JSON.stringify(game));
        const gameData = basicGameToData(game);
        const results: [string, number][] = [];
        results.push([ "raw", gameData.length]);
        for (const c of compressors) {
            const compressed = await c.compress(gameData);
            results.push([c.toString(), compressed.length]);
        }
        results.push(["fflate gzip", fflate.gzipSync(gameData, fflateOpts).length]);
        results.push(["fflate gzip w/dict", fflate.gzipSync(gameData, fflateOptsDict).length]);
        results.push(["fflate zlib", fflate.zlibSync(gameData, fflateOpts).length]);
        results.push(["fflate zlib w/dict", fflate.zlibSync(gameData, fflateOptsDict).length]);
        results.push(["fflate deflate", fflate.deflateSync(gameData, fflateOpts).length]);
        results.push(["fflate deflate w/dict", fflate.deflateSync(gameData, fflateOptsDict).length]);
        results.push(["brotli", brotli.compress(gameData, {quality: 11}).length]);
        results.push(["ppmd", PPMd.compress(gameData).length]);
        results.push(["packGame", packGame(game).length]);
        return results;
}
const benchmarkButton = document.getElementById('benchmark-button') as HTMLButtonElement;
const benchmarkTable = document.getElementById('benchmark-table') as HTMLTableElement;
benchmarkButton.onclick = async function (){
    let promises: Promise<readonly [string, number][]>[] = [];
    for (const key in library) {
        promises.push(benchmarkGame(library[key]));
    }
    let values = await Promise.all(promises);
    // Add column header
    let firstRow = benchmarkTable.insertRow();
    for (const entry of values[0]) {
        let cell = firstRow.insertCell();
        cell.innerHTML = entry[0];
    }
    // Make data
    for (const rowData of values) {
        let row = benchmarkTable.insertRow();
        for (const entry of rowData) {
            let cell = row.insertCell();
            cell.innerHTML = entry[1].toString();
        }
    }
    // Remove button
    benchmarkButton.remove();
};
const ppmdButton = document.getElementById('ppmd-button') as HTMLButtonElement;
const ppmdParagraph = document.getElementById('ppmd-paragraph') as HTMLParagraphElement;
function testPPMd(data: Uint8Array): boolean {
    let dataOut = PPMd.decompress(PPMd.compress(data));
    if (data.byteLength !== dataOut.byteLength) {
        return false;
    }
    for (let i = 0; i < data.byteLength; i++) {
        if (data[i] != dataOut[i]) {
            return false;
        }
    }
    return true;
}
ppmdButton.onclick = async function(){
    const zeroBytes = testPPMd(new Uint8Array(10240));
    const pong = testPPMd(basicGameToData(library["pong"]));
    const randomBytesArray = new Uint8Array(10240);
    for (let i = 0; i < randomBytesArray.byteLength; i++) {
        randomBytesArray[i] = Math.floor(Math.random() * 256);
    }
    const randomBytes = testPPMd(randomBytesArray);
    ppmdParagraph.innerHTML = `Zero bytes: ${zeroBytes} <br> Pong: ${pong} <br> Random Bytes: ${randomBytes}`
    ppmdButton.remove();
}