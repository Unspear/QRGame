import './page'
import library from './library'
import * as fflate from 'fflate'
import brotliPromise from 'brotli-wasm';
const brotli = await brotliPromise;
import * as PPMd from "./compressor"
import { Game } from './game';
import { DataTransform, packGame } from './pack';
import makeAirHockey from './games/airHockey'
const lzma = require("lzma/src/lzma_worker.js").LZMA_WORKER;

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
    //new StreamCompressor("deflate"),
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

function benchmarkGames(target: HTMLTableElement, games: Game[], name: string, compressor: DataTransform) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    let total = 0;
    for (const data of games) {
        const length = packGame(data, compressor).length;
        row.insertCell().innerText = length.toString();
        total += length;
    }
    row.insertCell().innerText = total.toString();
}

const benchmarkButton = document.getElementById('benchmark-button') as HTMLButtonElement;
const benchmarkTable = document.getElementById('benchmark-table') as HTMLTableElement;
benchmarkButton.onclick = async function (){
    // Add column header
    let firstRow = benchmarkTable.insertRow();
    firstRow.insertCell().innerText = "";
    for (const entry of library) {
        firstRow.insertCell().innerText = entry.metadata.title;
    }
    firstRow.insertCell().innerText = "Total"
    benchmarkGames(benchmarkTable, library, "raw", (data) => data);
    benchmarkGames(benchmarkTable, library, "gzip", (data) => fflate.gzipSync(data, fflateOpts));
    benchmarkGames(benchmarkTable, library, "zlib", (data) => fflate.zlibSync(data, fflateOpts));
    benchmarkGames(benchmarkTable, library, "lzma", (data) => lzma.compress(data, 9))
    benchmarkGames(benchmarkTable, library, "brotli", (data) => brotli.compress(data, {quality: 11}));
    benchmarkGames(benchmarkTable, library, "ppmd", (data) => PPMd.compress(data));
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
    const airHockey = testPPMd(basicGameToData(makeAirHockey()));
    const randomBytesArray = new Uint8Array(10240);
    for (let i = 0; i < randomBytesArray.byteLength; i++) {
        randomBytesArray[i] = Math.floor(Math.random() * 256);
    }
    const randomBytes = testPPMd(randomBytesArray);
    ppmdParagraph.innerHTML = `Zero bytes: ${zeroBytes} <br> Air Hockey: ${airHockey} <br> Random Bytes: ${randomBytes}`
    ppmdButton.remove();
}