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

const fflateOpts: fflate.DeflateOptions = {
    level: 9, 
    mem: 8
};

function downloadURL(data: string, fileName: string) {
  const a = document.createElement('a')
  a.href = data
  a.download = fileName
  document.body.appendChild(a)
  a.style.display = 'none'
  a.click()
  a.remove()
}

function downloadBlob(data: Uint8Array<ArrayBuffer>, fileName: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  downloadURL(url, fileName)
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

function benchmarkGamesBinary(target: HTMLTableElement, games: Game[], name: string, compressor: DataTransform) {
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
/*
function benchmarkGamesOuter(target: HTMLTableElement, games: Game[], name: string, compressor: DataTransform) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    let total = 0;
    for (const data of games) {
        const length = compressor(packGame(data, (data) => data)).length;
        row.insertCell().innerText = length.toString();
        total += length;
    }
    row.insertCell().innerText = total.toString();
}*/

function benchmarkGamesJson(target: HTMLTableElement, games: Game[], name: string, compressor: DataTransform) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    let total = 0;
    for (const data of games) {
        const length = compressor(new TextEncoder().encode(JSON.stringify(data))).length;
        row.insertCell().innerText = length.toString();
        total += length;
    }
    row.insertCell().innerText = total.toString();
}

const binaryButton = document.getElementById('binary-button') as HTMLButtonElement;
const binaryTable = document.getElementById('binary-table') as HTMLTableElement;
binaryButton.onclick = async function (){
    // Add column header
    let firstRow = binaryTable.insertRow();
    firstRow.insertCell().innerText = "Binary";
    for (const entry of library) {
        firstRow.insertCell().innerText = entry.metadata.title;
    }
    firstRow.insertCell().innerText = "Total"
    benchmarkGamesBinary(binaryTable, library, "Raw", (data) => data);
    benchmarkGamesBinary(binaryTable, library, "Deflate", (data) => fflate.zlibSync(data, fflateOpts));
    benchmarkGamesBinary(binaryTable, library, "LZMA", (data) => lzma.compress(data, 9))
    benchmarkGamesBinary(binaryTable, library, "Brotli", (data) => brotli.compress(data, {quality: 11}));
    benchmarkGamesBinary(binaryTable, library, "PPMII", (data) => PPMd.compress(data));
    // Remove button
    binaryButton.remove();
};
/*
const outerButton = document.getElementById('outer-button') as HTMLButtonElement;
const outerTable = document.getElementById('outer-table') as HTMLTableElement;
outerButton.onclick = async function (){
    // Add column header
    let firstRow = outerTable.insertRow();
    firstRow.insertCell().innerText = "Binary Outer";
    for (const entry of library) {
        firstRow.insertCell().innerText = entry.metadata.title;
    }
    firstRow.insertCell().innerText = "Total"
    benchmarkGamesOuter(outerTable, library, "Raw", (data) => data);
    benchmarkGamesOuter(outerTable, library, "Deflate", (data) => fflate.zlibSync(data, fflateOpts));
    benchmarkGamesOuter(outerTable, library, "LZMA", (data) => lzma.compress(data, 9))
    benchmarkGamesOuter(outerTable, library, "Brotli", (data) => brotli.compress(data, {quality: 11}));
    benchmarkGamesOuter(outerTable, library, "PPMII", (data) => PPMd.compress(data));
    // Remove button
    outerButton.remove();
};
*/
const jsonButton = document.getElementById('json-button') as HTMLButtonElement;
const jsonTable = document.getElementById('json-table') as HTMLTableElement;
jsonButton.onclick = async function (){
    // Add column header
    let firstRow = jsonTable.insertRow();
    firstRow.insertCell().innerText = "JSON";
    for (const entry of library) {
        firstRow.insertCell().innerText = entry.metadata.title;
    }
    firstRow.insertCell().innerText = "Total"
    benchmarkGamesJson(jsonTable, library, "Raw", (data) => data);
    benchmarkGamesJson(jsonTable, library, "Deflate", (data) => fflate.zlibSync(data, fflateOpts));
    benchmarkGamesJson(jsonTable, library, "LZMA", (data) => lzma.compress(data, 9))
    benchmarkGamesJson(jsonTable, library, "Brotli", (data) => brotli.compress(data, {quality: 11}));
    benchmarkGamesJson(jsonTable, library, "PPMII", (data) => PPMd.compress(data));
    // Remove button
    jsonButton.remove();
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
    const airHockey = testPPMd(packGame(makeAirHockey(), (data) => data));
    const randomBytesArray = new Uint8Array(10240);
    for (let i = 0; i < randomBytesArray.byteLength; i++) {
        randomBytesArray[i] = Math.floor(Math.random() * 256);
    }
    const randomBytes = testPPMd(randomBytesArray);
    ppmdParagraph.innerHTML = `Zero bytes: ${zeroBytes} <br> Air Hockey: ${airHockey} <br> Random Bytes: ${randomBytes}`
    ppmdButton.remove();
}