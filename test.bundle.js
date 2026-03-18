/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./games/airHockey.ts"
/*!****************************!*\
  !*** ./games/airHockey.ts ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ "./game.ts");

let script = `-- Paddles
local top = createSprite('----', 8, 96, 32)
top.width = 32
top.physics = true
top.static = true
local bottom = copySprite(top)
bottom.y = 256 - 32
-- Ball
local ball = createSprite('⬤', 4, 96, 128)
ball.width = 16
ball.physics = true
ball.bounce = true
-- Control Paddles
function drag(pos)
  local x = math.min(math.max(pos.x, 32), 192-32)
  if pos.y < 64 then
    top.x = x
  elseif pos.y > (256-64) then
    bottom.x = x 
  end
end
-- Score
top.score = 0
bottom.score = 0
local topScore = createSprite('', 12, 20, 4)
topScore.px = 0
topScore.py = 0
local bottomScore = createSprite('', 12, 192-20, 256-4)
bottomScore.px = 1
bottomScore.py = 1
-- Update score and reset ball
function newRound()
    topScore.char = tostring(top.score)
    bottomScore.char = tostring(bottom.score)
    ball.x = 96
    local dirY = math.random(0, 1)*2-1
    ball.y = 128-dirY*64
    ball.velY = dirY*3
    ball.velX = (math.random(0, 1)*2-1)*1.5
end
newRound()
-- Frame
function frame()
    if ball.y < 0 then
        top.score = top.score + 1
        newRound()
    end
    if ball.y > 256 then
        bottom.score = bottom.score + 1
        newRound()
    end
end`;
let tiles = '{"tileMap":{"dim":{"w":12,"h":1},"count":1,"tileData":[{"codePoint":[35,32,32,32,32,32,32,32,32,32,32,35],"color":[9,0,0,0,0,0,0,0,0,0,0,9]}]},"patchMap":{"dim":{"w":1,"h":16},"tileData":{"patchId":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}';
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    let parsed = JSON.parse(tiles);
    let game = new _game__WEBPACK_IMPORTED_MODULE_0__.Game({ title: "Air Hockey", description: "A 2-player air hockey game" }, script, parsed.tileMap, parsed.patchMap);
    game.solidTiles = ['#'.codePointAt(0)];
    return game;
}


/***/ },

/***/ "./games/daisy.ts"
/*!************************!*\
  !*** ./games/daisy.ts ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ "./game.ts");

let script = `
local sprites = {}

local chars = "🚲🌹🌷⚘🚲🌹🌷⚘"
local color = {1, 2, 7, 4, 1, 2, 7, 4}
local i = 1
for _, c in utf8.codes(chars) do
  sprites[i] = createSprite(utf8.char(c), color[i], 0, 0)
  i = i + 1
end

createSprite("👫", 4, 96, 128)

local seconds = 0
function frame()
  for i = 1, 8 do
    local r = 6.28 / 8 * i
    sprites[i].x = math.sin(seconds+r) * 60 + 96
    sprites[i].y = math.cos(seconds+r) * 60 + 128
  end
  seconds = seconds + FRAME_TIME
end

say([[
Daisy, Daisy,
Give me your answer, do!
I'm half crazy,
All for the love of you!
It won't be a stylish marriage,
I can't afford a carriage,
But you'll look sweet upon the seat
Of a bicycle built for two!
]])`;
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    return new _game__WEBPACK_IMPORTED_MODULE_0__.Game({ title: "Daisy Bell", description: "A demo showing text-to-speech and sprite manipulation" }, script);
}


/***/ },

/***/ "./games/infinity.ts"
/*!***************************!*\
  !*** ./games/infinity.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ "./game.ts");

let script = `function frame()
  camera.x = camera.x + FRAME_TIME * 30
  if camera.x > 16 * 16 then
    camera.x = camera.x - 16 * 16
  end
end`;
let tiles = `{"tileMap":{"dim":{"w":4,"h":4},"count":4,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[12,12,12,12,12,10,10,12,12,10,10,12,12,12,12,12]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[9,9,9,9,9,8,8,9,9,8,8,9,9,9,9,9]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[13,13,13,13,13,14,14,13,13,14,14,13,13,13,13,13]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[15,15,15,15,15,11,11,15,15,11,11,15,15,15,15,15]}]},"patchMap":{"dim":{"w":12,"h":4},"tileData":{"patchId":[0,1,2,3,0,1,2,3,0,1,2,3,1,2,3,0,1,2,3,0,1,2,3,0,2,3,0,1,2,3,0,1,2,3,0,1,3,0,1,2,3,0,1,2,3,0,1,2],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}`;
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    let parsed = JSON.parse(tiles);
    return new _game__WEBPACK_IMPORTED_MODULE_0__.Game({ title: "Infinity", description: "A demo showing camera movement and the tile patch system" }, script, parsed.tileMap, parsed.patchMap);
}


/***/ },

/***/ "./games/platformer.ts"
/*!*****************************!*\
  !*** ./games/platformer.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ "./game.ts");

let script = `local player = createSprite('🕴', 0, 96, 128)
player.width = 8
player.physics = true
function frame()
  player.velY = player.velY + FRAME_TIME
  camera.x = player.x - 96
end`;
let tiles = '{"tileMap":{"dim":{"w":4,"h":4},"count":12,"tileData":[{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14]},{"codePoint":[32,32,32,32,32,47,32,32,47,126,95,47,32,32,32,32],"color":[14,14,14,14,14,8,14,14,8,8,8,8,14,14,14,14]},{"codePoint":[35,35,35,35,91,61,61,61,61,91,61,61,61,61,91,61],"color":[10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"codePoint":[32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32],"color":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}]},"patchMap":{"dim":{"w":36,"h":4},"tileData":{"patchId":[0,1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1,1,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"transform":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}';
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    let parsed = JSON.parse(tiles);
    let game = new _game__WEBPACK_IMPORTED_MODULE_0__.Game({ title: "Platformer", description: "A platformer" }, script, parsed.tileMap, parsed.patchMap);
    game.solidTiles = ['#'.codePointAt(0)];
    return game;
}


/***/ },

/***/ "./games/soundEffects.ts"
/*!*******************************!*\
  !*** ./games/soundEffects.ts ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game */ "./game.ts");

let script = `-- Noise 1
--audio.noise(0.5).addLowpass(10000).driveFrequency(audio.linear(1000, 0.25)).addGain(1.0).driveGain(audio.linear(0.0, 0.5)).output()
-- Noise 2
--audio.noise(0.5).addLowpass(50).driveFrequency(audio.exp(10000, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Noise 3
--audio.noise(0.5).addLowpass(10000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Noise 4
--audio.noise(0.5).addLowpass(1000).driveFrequency(audio.exp(10, 0.25)).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Bling
--audio.triangle("A5", 1).driveDetune(audio.square(12, 1).addGain(300), audio.square(6, 1).addGain(600)).addLowpass(1000).addGain(1.0).driveGain(audio.linear(0, 1)).output()
-- Ring
--audio.triangle("C5", 1.25).driveDetune(audio.square(12, 1.25).addGain(300)).addLowpass(400).addGain(1.0).driveGain(audio.step(1, 1), audio.linear(0, 1.25)).output()
-- Laser
--audio.sawtooth("C6", 0.5).driveFrequency(audio.triangle(120, 0.5).addGain(100), audio.linear("C5", 0.25)).addLowpass(1800).addGain(1.0).driveGain(audio.linear(0, 0.5)).output()
-- Witch
--audio.sawtooth('A4', 3.5).driveDetune(audio.sine(18, 3.5).driveFrequency(audio.sine(12, 3.5).addGain(50)).addGain(150)).driveFrequency(audio.linear("G3", 3)).addLowpass(1000).driveFrequency(audio.triangle(4, 3.5).addGain(1000)).addGain(1).driveGain(audio.linear(1, 0.125), audio.linear(0, 3.5)).output()
-- Emergency
--audio.sine("A4", 2).driveDetune(audio.sine(2, 2).addGain(600)).addLowpass(800).addGain(1).driveGain(audio.linear(0, 2)).output()
-- Game Over
--audio.sawtooth("A3", 4).driveDetune(audio.sine(4, 4).addGain(100)).driveFrequency(audio.linear("E2", 3)).addLowpass(1200).addGain(1).driveGain(audio.linear(0, 4)).output()`;
/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {
    let game = new _game__WEBPACK_IMPORTED_MODULE_0__.Game({ title: "Sound Effects", description: "Showcasing sound effects" }, script);
    return game;
}


/***/ },

/***/ "./library.ts"
/*!********************!*\
  !*** ./library.ts ***!
  \********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./game.ts");
/* harmony import */ var _games_airHockey__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./games/airHockey */ "./games/airHockey.ts");
/* harmony import */ var _games_daisy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./games/daisy */ "./games/daisy.ts");
/* harmony import */ var _games_infinity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./games/infinity */ "./games/infinity.ts");
/* harmony import */ var _games_platformer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./games/platformer */ "./games/platformer.ts");
/* harmony import */ var _games_soundEffects__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./games/soundEffects */ "./games/soundEffects.ts");






/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([new _game__WEBPACK_IMPORTED_MODULE_0__.Game(), (0,_games_airHockey__WEBPACK_IMPORTED_MODULE_1__["default"])(), (0,_games_daisy__WEBPACK_IMPORTED_MODULE_2__["default"])(), (0,_games_infinity__WEBPACK_IMPORTED_MODULE_3__["default"])(), (0,_games_platformer__WEBPACK_IMPORTED_MODULE_4__["default"])(), (0,_games_soundEffects__WEBPACK_IMPORTED_MODULE_5__["default"])()]);


/***/ },

/***/ "./test.ts"
/*!*****************!*\
  !*** ./test.ts ***!
  \*****************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./page */ "./page.js");
/* harmony import */ var _library__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./library */ "./library.ts");
/* harmony import */ var fflate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! fflate */ "../node_modules/fflate/esm/browser.js");
/* harmony import */ var brotli_wasm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! brotli-wasm */ "../node_modules/brotli-wasm/index.web.js");
/* harmony import */ var _compressor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./compressor */ "./compressor.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./game */ "./game.ts");
/* harmony import */ var _pack__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pack */ "./pack.ts");
/* harmony import */ var _games_airHockey__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./games/airHockey */ "./games/airHockey.ts");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_compressor__WEBPACK_IMPORTED_MODULE_4__, _pack__WEBPACK_IMPORTED_MODULE_6__]);
([_compressor__WEBPACK_IMPORTED_MODULE_4__, _pack__WEBPACK_IMPORTED_MODULE_6__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);




const brotli = await brotli_wasm__WEBPACK_IMPORTED_MODULE_3__["default"];




const LUA_KEYWORDS = `andbreakdoelseelseifendfalseforfunctionifinlocalnilnotorrepeatreturnthentrueuntilwhile`;
function basicGameToData(game) {
    return new TextEncoder().encode(JSON.stringify(game));
}
function basicGameFromData(data) {
    if (data === null)
        return new _game__WEBPACK_IMPORTED_MODULE_5__.Game();
    const string = new TextDecoder().decode(data);
    if (string.length === 0)
        return new _game__WEBPACK_IMPORTED_MODULE_5__.Game();
    const parsed = JSON.parse(string);
    return new _game__WEBPACK_IMPORTED_MODULE_5__.Game(parsed.script, parsed.tileMap);
}
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
    #algorithm;
}
const compressors = [
    new StreamCompressor("deflate-raw"),
    new StreamCompressor("gzip"),
    new StreamCompressor("deflate"),
];
const fflateOpts = {
    level: 9,
    mem: 8
};
const fflateOptsDict = {
    level: 9,
    mem: 8,
    dictionary: new TextEncoder().encode(LUA_KEYWORDS)
};
async function benchmarkGamesAsync(target, games, name, compressionFunction) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    for (const data of games) {
        row.insertCell().innerText = (await compressionFunction(data)).length.toString();
    }
}
function benchmarkGames(target, games, name, compressionFunction) {
    const row = target.insertRow();
    row.insertCell().innerText = name;
    for (const data of games) {
        row.insertCell().innerText = compressionFunction(data).length.toString();
    }
}
const benchmarkButton = document.getElementById('benchmark-button');
const benchmarkTable = document.getElementById('benchmark-table');
benchmarkButton.onclick = async function () {
    // Add column header
    let firstRow = benchmarkTable.insertRow();
    firstRow.insertCell().innerText = "";
    for (const entry of _library__WEBPACK_IMPORTED_MODULE_1__["default"]) {
        firstRow.insertCell().innerText = entry.metadata.title;
    }
    const data = _library__WEBPACK_IMPORTED_MODULE_1__["default"].map((game) => basicGameToData(game));
    benchmarkGames(benchmarkTable, data, "raw", (data) => data);
    for (const c of compressors) {
        benchmarkGamesAsync(benchmarkTable, data, c.toString(), (data) => c.compress(data));
    }
    benchmarkGames(benchmarkTable, data, "fflate gzip", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.gzipSync(gameData, fflateOpts));
    benchmarkGames(benchmarkTable, data, "fflate gzip w/dict", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.gzipSync(gameData, fflateOptsDict));
    benchmarkGames(benchmarkTable, data, "fflate zlib", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.zlibSync(gameData, fflateOpts));
    benchmarkGames(benchmarkTable, data, "fflate zlib w/dict", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.zlibSync(gameData, fflateOptsDict));
    benchmarkGames(benchmarkTable, data, "fflate deflate", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.deflateSync(gameData, fflateOpts));
    benchmarkGames(benchmarkTable, data, "fflate deflate w/dict", (gameData) => fflate__WEBPACK_IMPORTED_MODULE_2__.deflateSync(gameData, fflateOptsDict));
    benchmarkGames(benchmarkTable, data, "brotli", (gameData) => brotli.compress(gameData, { quality: 11 }));
    benchmarkGames(benchmarkTable, data, "ppmd", (gameData) => _compressor__WEBPACK_IMPORTED_MODULE_4__.compress(gameData));
    // Pack Game Properly
    const row = benchmarkTable.insertRow();
    row.insertCell().innerText = "packGame";
    for (const game of _library__WEBPACK_IMPORTED_MODULE_1__["default"]) {
        row.insertCell().innerText = (0,_pack__WEBPACK_IMPORTED_MODULE_6__.packGame)(game).length.toString();
    }
    // Remove button
    benchmarkButton.remove();
};
const ppmdButton = document.getElementById('ppmd-button');
const ppmdParagraph = document.getElementById('ppmd-paragraph');
function testPPMd(data) {
    let dataOut = _compressor__WEBPACK_IMPORTED_MODULE_4__.decompress(_compressor__WEBPACK_IMPORTED_MODULE_4__.compress(data));
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
ppmdButton.onclick = async function () {
    const zeroBytes = testPPMd(new Uint8Array(10240));
    const airHockey = testPPMd(basicGameToData((0,_games_airHockey__WEBPACK_IMPORTED_MODULE_7__["default"])()));
    const randomBytesArray = new Uint8Array(10240);
    for (let i = 0; i < randomBytesArray.byteLength; i++) {
        randomBytesArray[i] = Math.floor(Math.random() * 256);
    }
    const randomBytes = testPPMd(randomBytesArray);
    ppmdParagraph.innerHTML = `Zero bytes: ${zeroBytes} <br> Air Hockey: ${airHockey} <br> Random Bytes: ${randomBytes}`;
    ppmdButton.remove();
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var hasSymbol = typeof Symbol === "function";
/******/ 		var webpackQueues = hasSymbol ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = hasSymbol ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = hasSymbol ? Symbol("webpack error") : "__webpack_error__";
/******/ 		
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 		
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 		
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			var handle = (deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 		
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}
/******/ 			var done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 			body(handle, done);
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = (typeof document !== 'undefined' && document.baseURI) || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"test": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_brotli-wasm_index_web_js-node_modules_fflate_esm_browser_js","page_js-pack_ts"], () => (__webpack_require__("./test.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=test.bundle.js.map