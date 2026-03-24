import './page'
import library from './library'
import * as fflate from 'fflate'
import brotliPromise from 'brotli-wasm';
const brotli = await brotliPromise;
import * as PPMd from "./compressor"
import { Game } from './game';
import { packGame } from './pack';
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

async function benchmarkGamesAsync(target: HTMLTableElement, games: Uint8Array<ArrayBuffer>[], name: string, compressionFunction: (data: Uint8Array<ArrayBuffer>) => Promise<Uint8Array>) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    for (const data of games) {
        row.insertCell().innerText = (await compressionFunction(data)).length.toString();
    }
}
function benchmarkGames(target: HTMLTableElement, games: Uint8Array<ArrayBuffer>[], name: string, compressionFunction: (data: Uint8Array<ArrayBuffer>) => Uint8Array) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    for (const data of games) {
        row.insertCell().innerText = compressionFunction(data).length.toString();
    }
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
    const data = library.map((game: Game) => basicGameToData(game));
    benchmarkGames(benchmarkTable, data, "raw", (data) => data);
    for (const c of compressors) {
        benchmarkGamesAsync(benchmarkTable, data, c.toString(), (data) => c.compress(data));
    }
    //benchmarkGames(benchmarkTable, data, "fflate gzip", (gameData) => fflate.gzipSync(gameData, fflateOpts));
    //benchmarkGames(benchmarkTable, data, "fflate gzip w/dict", (gameData) => fflate.gzipSync(gameData, fflateOptsDict));
    benchmarkGames(benchmarkTable, data, "fflate zlib", (gameData) => fflate.zlibSync(gameData, fflateOpts));
    //benchmarkGames(benchmarkTable, data, "fflate zlib w/dict", (gameData) => fflate.zlibSync(gameData, fflateOptsDict));
    //benchmarkGames(benchmarkTable, data, "fflate deflate", (gameData) => fflate.deflateSync(gameData, fflateOpts));
    //benchmarkGames(benchmarkTable, data, "fflate deflate w/dict", (gameData) => fflate.deflateSync(gameData, fflateOptsDict));
    benchmarkGames(benchmarkTable, data, "lzma", (gameData) => lzma.compress(gameData, 9))
    benchmarkGames(benchmarkTable, data, "brotli", (gameData) => brotli.compress(gameData, {quality: 11}));
    benchmarkGames(benchmarkTable, data, "ppmd", (gameData) => PPMd.compress(gameData));
    // Pack Game Properly
    const row = benchmarkTable.insertRow();
    row.insertCell().innerText = "packGame";
    for (const game of library) {
        row.insertCell().innerText = packGame(game).length.toString();
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
    const airHockey = testPPMd(basicGameToData(makeAirHockey()));
    const randomBytesArray = new Uint8Array(10240);
    for (let i = 0; i < randomBytesArray.byteLength; i++) {
        randomBytesArray[i] = Math.floor(Math.random() * 256);
    }
    const randomBytes = testPPMd(randomBytesArray);
    ppmdParagraph.innerHTML = `Zero bytes: ${zeroBytes} <br> Air Hockey: ${airHockey} <br> Random Bytes: ${randomBytes}`
    ppmdButton.remove();
}