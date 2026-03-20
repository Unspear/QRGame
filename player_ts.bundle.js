(self["webpackChunk"] = self["webpackChunk"] || []).push([["player_ts"],{

/***/ "./audio.ts"
/*!******************!*\
  !*** ./audio.ts ***!
  \******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioAccessor: () => (/* binding */ AudioAccessor),
/* harmony export */   AudioEngine: () => (/* binding */ AudioEngine),
/* harmony export */   AudioNodeWrapper: () => (/* binding */ AudioNodeWrapper),
/* harmony export */   BaseSoundNode: () => (/* binding */ BaseSoundNode),
/* harmony export */   BufferSoundNode: () => (/* binding */ BufferSoundNode),
/* harmony export */   FilterSoundNode: () => (/* binding */ FilterSoundNode),
/* harmony export */   GainSoundNode: () => (/* binding */ GainSoundNode),
/* harmony export */   OscillatorSoundNode: () => (/* binding */ OscillatorSoundNode),
/* harmony export */   SoundMod: () => (/* binding */ SoundMod)
/* harmony export */ });
/* harmony import */ var sam_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sam-js */ "../node_modules/sam-js/dist/samjs.esm.min.js");

function noteToFrequency(note) {
    return 440 * Math.pow(2, (noteToMIDI(note) - 69) / 12);
}
function noteToMIDI(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);
    return (octave + 1) * 12 + noteNames.indexOf(noteName.toUpperCase());
}
function parseFrequency(input) {
    return (typeof input === "string") ? noteToFrequency(input) : input;
}
class SoundMod {
    type;
    value;
    duration;
    constructor(type, value, duration) {
        this.type = type;
        this.value = value;
        this.duration = duration;
    }
}
function driveValue(ctx, target, inputs) {
    for (let input of inputs) {
        if (input instanceof AudioNodeWrapper) {
            input.modulate(target);
        }
        else if (typeof input === "number") {
            target.setValueAtTime(input, ctx.currentTime);
        }
        else {
            switch (input.type) {
                case "linear":
                    target.linearRampToValueAtTime(input.value, ctx.currentTime + input.duration);
                    break;
                case "exponential":
                    target.exponentialRampToValueAtTime(input.value, ctx.currentTime + input.duration);
                    break;
                case "step":
                    target.setValueAtTime(input.value, ctx.currentTime + input.duration);
                    break;
            }
        }
    }
}
class AudioNodeWrapper {
    #engine;
    node;
    constructor(engine, audioNode) {
        this.#engine = engine;
        this.node = audioNode;
    }
    addLowpass(frequency) {
        let newNode = new FilterSoundNode(this.#engine, new BiquadFilterNode(this.node.context, {
            type: "lowpass",
            frequency: frequency,
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    addHighpass(frequency) {
        let newNode = new FilterSoundNode(this.#engine, new BiquadFilterNode(this.node.context, {
            type: "highpass",
            frequency: frequency,
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    addGain(gain) {
        let newNode = new GainSoundNode(this.#engine, new GainNode(this.node.context, {
            gain: gain
        }));
        this.node.connect(newNode.node);
        return newNode;
    }
    modulate(target) {
        this.node.connect(target);
    }
    output() {
        this.node.connect(this.#engine.output);
    }
}
class BaseSoundNode extends AudioNodeWrapper {
}
class BufferSoundNode extends AudioNodeWrapper {
    driveRate(...rate) {
        driveValue(this.node.context, this.node.playbackRate, rate);
        return this;
    }
    driveDetune(...cents) {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
}
class OscillatorSoundNode extends AudioNodeWrapper {
    driveFrequency(...frequency) {
        driveValue(this.node.context, this.node.frequency, frequency);
        return this;
    }
    driveDetune(...cents) {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
}
class FilterSoundNode extends AudioNodeWrapper {
    driveQuality(...quality) {
        driveValue(this.node.context, this.node.Q, quality);
        return this;
    }
    driveFrequency(...frequency) {
        driveValue(this.node.context, this.node.frequency, frequency);
        return this;
    }
    driveDetune(...cents) {
        driveValue(this.node.context, this.node.detune, cents);
        return this;
    }
    driveGian(...gain) {
        driveValue(this.node.context, this.node.gain, gain);
        return this;
    }
}
class GainSoundNode extends AudioNodeWrapper {
    driveGain(...gain) {
        driveValue(this.node.context, this.node.gain, gain);
        return this;
    }
}
class AudioEngine {
    tts;
    ctx;
    output;
    noiseBuffer;
    constructor() {
        this.tts = new sam_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.ctx = new AudioContext();
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
        this.setVolume(0.25);
        this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        let output = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }
    setPaused(value) {
        if (value) {
            this.ctx.suspend();
        }
        else {
            this.ctx.resume();
        }
    }
    close() {
        this.ctx.close();
    }
    setVolume(value) {
        this.output.gain.value = value;
    }
    getVolume() {
        return this.output.gain.value;
    }
}
class AudioAccessor {
    #engine;
    constructor(engine) {
        this.#engine = engine;
    }
    wave(type, frequency, length) {
        let oscNode = this.#engine.ctx.createOscillator();
        oscNode.type = type;
        oscNode.frequency.value = parseFrequency(frequency);
        oscNode.start();
        oscNode.stop(this.#engine.ctx.currentTime + length);
        return new OscillatorSoundNode(this.#engine, oscNode);
    }
    triangle(frequency, length) {
        return this.wave("triangle", frequency, length);
    }
    sawtooth(frequency, length) {
        return this.wave("sawtooth", frequency, length);
    }
    sine(frequency, length) {
        return this.wave("sine", frequency, length);
    }
    square(frequency, length) {
        return this.wave("square", frequency, length);
    }
    noise(length) {
        let noiseNode = this.#engine.ctx.createBufferSource();
        noiseNode.buffer = this.#engine.noiseBuffer;
        noiseNode.loop = true;
        noiseNode.start();
        noiseNode.stop(this.#engine.ctx.currentTime + length);
        return new BufferSoundNode(this.#engine, noiseNode);
    }
    speech(text, length = 0) {
        // Replace non-ascii and control characters with space
        const speechData = this.#engine.tts.buf8(text.replace(/[^\x20-\x7E]/g, " "));
        const speechBuffer = this.#engine.ctx.createBuffer(1, speechData.length, 22050);
        const speechChannelData = speechBuffer.getChannelData(0);
        for (let i = 0; i < speechData.length; i++) {
            speechChannelData[i] = speechData[i] / 127.5 - 1;
        }
        const speechNode = this.#engine.ctx.createBufferSource();
        speechNode.buffer = speechBuffer;
        speechNode.start();
        if (length > 0) {
            speechNode.loop = true;
            speechNode.stop(this.#engine.ctx.currentTime + length);
        }
        return new BufferSoundNode(this.#engine, speechNode);
    }
    linear(value, duration) {
        return new SoundMod("linear", parseFrequency(value), duration);
    }
    exp(value, duration) {
        return new SoundMod("exponential", parseFrequency(value), duration);
    }
    step(value, duration) {
        return new SoundMod("step", parseFrequency(value), duration);
    }
}


/***/ },

/***/ "./camera.ts"
/*!*******************!*\
  !*** ./camera.ts ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
class Camera {
    #pos;
    constructor() {
        this.#pos = { x: 0, y: 0 };
    }
    set x(value) {
        this.#pos.x = value;
    }
    set y(value) {
        this.#pos.y = value;
    }
    get x() {
        return this.#pos.x;
    }
    get y() {
        return this.#pos.y;
    }
    getPos() {
        return Object.assign({}, this.#pos);
    }
    getViewOffset() {
        let offsetX = -this.#pos.x;
        let offsetY = -this.#pos.y;
        return { x: offsetX, y: offsetY };
    }
}


/***/ },

/***/ "./engine.ts"
/*!*******************!*\
  !*** ./engine.ts ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Engine: () => (/* binding */ Engine)
/* harmony export */ });
/* harmony import */ var wasmoon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasmoon */ "../node_modules/wasmoon/dist/index.js");
/* harmony import */ var wasmoon__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(wasmoon__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! matter-js */ "../node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _physicsInput__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./physicsInput */ "./physicsInput.ts");
/* harmony import */ var _sprite__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprite */ "./sprite.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants */ "./constants.ts");
/* harmony import */ var _tile__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tile */ "./tile.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util */ "./util.ts");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./camera */ "./camera.ts");
/* harmony import */ var wasmoon_dist_glue_wasm__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! wasmoon/dist/glue.wasm */ "../node_modules/wasmoon/dist/glue.wasm");
/* harmony import */ var _press_play_png__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./press-play.png */ "./press-play.png");
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./render */ "./render.ts");
/* harmony import */ var _audio__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./audio */ "./audio.ts");












let pressPlayImage = new Image();
pressPlayImage.src = _press_play_png__WEBPACK_IMPORTED_MODULE_9__;
class Engine {
    gameCanvas;
    gameErrors;
    luaFactory;
    downPointers;
    renderer;
    audio;
    #paused;
    pointerEventQueue;
    game;
    sprites;
    tileMap;
    camera;
    matterEngine;
    physicsInput;
    lua;
    ranScript;
    luaFrame;
    luaDrag;
    luaTap;
    constructor(gameCanvas, gameErrors) {
        this.pointerEventQueue = [];
        this.#paused = false;
        this.gameCanvas = gameCanvas;
        this.gameErrors = gameErrors;
        this.audio = new _audio__WEBPACK_IMPORTED_MODULE_11__.AudioEngine();
        this.luaFactory = new wasmoon__WEBPACK_IMPORTED_MODULE_0__.LuaFactory(wasmoon_dist_glue_wasm__WEBPACK_IMPORTED_MODULE_8__);
        this.renderer = new _render__WEBPACK_IMPORTED_MODULE_10__.Renderer(this.gameCanvas);
        this.downPointers = new Map();
        this.ranScript = false;
        gameCanvas.addEventListener('pointerdown', (event) => this.pointerEventQueue.push({ type: "down", event: event }));
        gameCanvas.addEventListener('pointermove', (event) => this.pointerEventQueue.push({ type: "move", event: event }));
        window.addEventListener('pointerup', (event) => this.pointerEventQueue.push({ type: "up", event: event }));
        gameCanvas.addEventListener('drag', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragstart', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragend', (event) => event.preventDefault(), { passive: false });
    }
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        // Clear game errors
        this.gameErrors.textContent = '';
        this.ranScript = false;
        this.sprites = [];
        const gameTileMap = _tile__WEBPACK_IMPORTED_MODULE_5__.TileMap.Copy(game.tileMap);
        const gamePatchMap = _tile__WEBPACK_IMPORTED_MODULE_5__.PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new _camera__WEBPACK_IMPORTED_MODULE_7__.Camera();
        if (this.audio) {
            this.audio.close();
        }
        this.audio = new _audio__WEBPACK_IMPORTED_MODULE_11__.AudioEngine();
        // Create physics engine
        matter_js__WEBPACK_IMPORTED_MODULE_1__.Resolver._restingThresh = 1;
        this.matterEngine = matter_js__WEBPACK_IMPORTED_MODULE_1__.Engine.create({
            gravity: { scale: 0 }
        });
        // Create bodies
        const options = {
            restitution: 1.0,
            frictionAir: 0.0,
            friction: 0.0,
            isStatic: true
        };
        for (let y = 0; y < this.tileMap.dim.h; y++) {
            for (let x = 0; x < this.tileMap.dim.w; x++) {
                const tile = this.tileMap.getTile({ x: x, y: y });
                if (game.solidTiles.includes(tile.codePoint)) {
                    const physBody = matter_js__WEBPACK_IMPORTED_MODULE_1__.Bodies.rectangle((x + 0.5) * _constants__WEBPACK_IMPORTED_MODULE_4__.CHAR_WIDTH, (y + 0.5) * _constants__WEBPACK_IMPORTED_MODULE_4__.CHAR_WIDTH, _constants__WEBPACK_IMPORTED_MODULE_4__.CHAR_WIDTH, _constants__WEBPACK_IMPORTED_MODULE_4__.CHAR_WIDTH, options);
                    matter_js__WEBPACK_IMPORTED_MODULE_1__.Composite.add(this.matterEngine.world, physBody);
                }
            }
        }
        // Create sprite drag constraint
        this.physicsInput = new _physicsInput__WEBPACK_IMPORTED_MODULE_2__.SpriteDragConstraint(this.matterEngine, this.gameCanvas);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine();
        this.lua.global.set('FRAME_TIME', _constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME);
        this.lua.global.set('createSprite', (char, color, x, y) => {
            let newSprite = new _sprite__WEBPACK_IMPORTED_MODULE_3__.Sprite(char, color, x, y);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('destroySprite', (sprite) => {
            this.sprites = this.sprites.filter(s => s !== sprite);
        });
        this.lua.global.set('copySprite', (sprite) => {
            let newSprite = _sprite__WEBPACK_IMPORTED_MODULE_3__.Sprite.Copy(sprite);
            this.sprites.push(newSprite);
            return newSprite;
        });
        // Simple Audio functions
        this.lua.global.set('audio', new _audio__WEBPACK_IMPORTED_MODULE_11__.AudioAccessor(this.audio));
        this.lua.global.set('camera', this.camera);
        // Start
        this.renderer.startRenderLoop(() => this.#doFrame());
    }
    setPaused(value) {
        this.#paused = value;
        this.renderer.paused = value;
        this.audio.setPaused(value);
    }
    get paused() {
        return this.#paused;
    }
    #doFrame() {
        // Run Script
        if (!this.ranScript) {
            this.ranScript = true;
            // Load Script
            try {
                this.lua.doStringSync(this.game.script);
            }
            catch (error) {
                let p = document.createElement("p");
                p.innerText = `${error}`;
                this.gameErrors.appendChild(p);
            }
            // Get Lua References
            this.luaFrame = this.lua.global.get('frame');
            this.luaTap = this.lua.global.get('tap');
            this.luaDrag = this.lua.global.get('drag');
        }
        // Frame
        if (this.luaFrame) {
            this.luaFrame();
        }
        // Pointer events
        while (this.pointerEventQueue.length > 0) {
            let queued = this.pointerEventQueue.shift();
            const pos = _util__WEBPACK_IMPORTED_MODULE_6__.getPointerPos(this.gameCanvas, queued.event);
            switch (queued.type) {
                case "down":
                    this.downPointers.set(queued.event.pointerId, pos);
                    if (this.luaDrag) {
                        this.luaDrag(pos);
                    }
                    if (this.luaTap) {
                        this.luaTap();
                    }
                    this.physicsInput.onPointerDown(this.matterEngine, queued.event.pointerId, pos);
                    break;
                case "move":
                    if (this.downPointers.has(queued.event.pointerId)) {
                        this.downPointers.set(queued.event.pointerId, pos);
                        if (this.luaDrag) {
                            this.luaDrag(pos);
                        }
                    }
                    this.physicsInput.onPointerMove(queued.event.pointerId, pos);
                    break;
                case "up":
                    this.downPointers.delete(queued.event.pointerId);
                    this.physicsInput.onPointerUp(queued.event.pointerId, pos);
                    break;
            }
        }
        // Physics
        for (let sprite of this.sprites) {
            sprite.prePhysicsUpdate(this.matterEngine);
        }
        matter_js__WEBPACK_IMPORTED_MODULE_1__.Engine.update(this.matterEngine, _constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS);
        for (let sprite of this.sprites) {
            sprite.postPhysicsUpdate(this.matterEngine);
        }
        // Rendering
        // Fill Background
        this.renderer.beginFrame();
        this.renderer.viewOffset = this.camera.getViewOffset();
        // Draw Tilemap
        this.tileMap.draw(this.renderer);
        // Draw Sprites
        for (let sprite of this.sprites) {
            sprite.draw(this.renderer);
        }
        this.renderer.endFrame();
    }
}


/***/ },

/***/ "./physicsInput.ts"
/*!*************************!*\
  !*** ./physicsInput.ts ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpriteDragConstraint: () => (/* binding */ SpriteDragConstraint)
/* harmony export */ });
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! matter-js */ "../node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_0__);

class SpriteDragConstraint {
    type;
    element;
    constraint;
    collisionFilter;
    pointerId;
    constructor(engine, canvas) {
        this.type = 'spriteDragConstraint';
        this.element = canvas;
        this.constraint = matter_js__WEBPACK_IMPORTED_MODULE_0__.Constraint.create({
            label: 'Sprite Drag Constraint',
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            length: 0.01,
            stiffness: 0.1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            },
        });
        this.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        };
        this.pointerId = -1;
        matter_js__WEBPACK_IMPORTED_MODULE_0__.Composite.add(engine.world, this.constraint);
    }
    onPointerDown(matterEngine, pointerId, pos) {
        let bodies = matter_js__WEBPACK_IMPORTED_MODULE_0__.Composite.allBodies(matterEngine.world);
        for (let body of bodies) {
            // Broad phase
            if (body.plugin.sprite
                && matter_js__WEBPACK_IMPORTED_MODULE_0__.Bounds.contains(body.bounds, pos)
                && matter_js__WEBPACK_IMPORTED_MODULE_0__.Detector.canCollide(body.collisionFilter, this.collisionFilter)) {
                // Narrow phase
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    if (matter_js__WEBPACK_IMPORTED_MODULE_0__.Vertices.contains(part.vertices, pos)) {
                        let sprite = body.plugin.sprite;
                        // Try Drag
                        if (!this.constraint.bodyB && sprite.drag) {
                            // Start drag
                            this.constraint.pointA = pos;
                            this.constraint.bodyB = body;
                            this.constraint.pointB = { x: pos.x - body.position.x, y: pos.y - body.position.y };
                            this.pointerId = pointerId;
                            matter_js__WEBPACK_IMPORTED_MODULE_0__.Sleeping.set(body, false);
                        }
                        // Try Tap
                        if (sprite.tap instanceof Function) {
                            sprite.tap();
                        }
                    }
                }
            }
        }
    }
    onPointerMove(pointerId, pos) {
        if (this.constraint.bodyB && this.pointerId === pointerId) { // If there is a body constrained
            matter_js__WEBPACK_IMPORTED_MODULE_0__.Sleeping.set(this.constraint.bodyB, false);
            this.constraint.pointA.x = pos.x;
            this.constraint.pointA.y = pos.y;
        }
    }
    ;
    onPointerUp(pointerId, pos) {
        if (pointerId === this.pointerId) {
            this.constraint.bodyB = null;
            this.pointerId = -1;
        }
    }
}


/***/ },

/***/ "./player.ts"
/*!*******************!*\
  !*** ./player.ts ***!
  \*******************/
(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Player: () => (/* binding */ Player)
/* harmony export */ });
/* harmony import */ var lean_qr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lean-qr */ "../node_modules/lean-qr/index.mjs");
/* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./engine */ "./engine.ts");
/* harmony import */ var _pack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pack */ "./pack.ts");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pack__WEBPACK_IMPORTED_MODULE_2__]);
var __webpack_async_dependencies_result__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
_pack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_async_dependencies_result__[0];



class Player {
    canvas;
    errors;
    playButton;
    pauseButton;
    reloadButton;
    playMenuDiv;
    urlButton;
    qrButton;
    qrCanvas;
    gameTitle;
    openEditorButton;
    closeEditorButton;
    gameDescription;
    game;
    gameProvider;
    constructor(gameProvider, isEditor) {
        if (navigator.audioSession) {
            navigator.audioSession.type = "playback";
        }
        this.gameProvider = gameProvider;
        this.game = gameProvider();
        this.canvas = document.getElementById('game-canvas');
        this.errors = document.getElementById('game-errors');
        this.playButton = document.getElementById('play-button');
        this.pauseButton = document.getElementById('pause-button');
        this.reloadButton = document.getElementById('reload-button');
        this.playMenuDiv = document.getElementById('play-menu');
        this.urlButton = document.getElementById('url-button');
        this.qrButton = document.getElementById('qr-button');
        this.qrCanvas = document.getElementById('qr-canvas');
        this.openEditorButton = document.getElementById('open-editor-button');
        this.closeEditorButton = document.getElementById('close-editor-button');
        if (isEditor) {
            this.openEditorButton.classList.toggle("hidden", true);
        }
        else {
            this.closeEditorButton.classList.toggle("hidden", true);
        }
        this.gameTitle = document.getElementById('game-title');
        this.gameDescription = document.getElementById('game-description');
        const engine = new _engine__WEBPACK_IMPORTED_MODULE_1__.Engine(this.canvas, this.errors);
        this.updatePlayer();
        // Buttons
        this.playButton.onclick = () => {
            if (engine.game === undefined) {
                engine.play(this.game);
            }
            engine.setPaused(false);
            this.playMenuDiv.classList.toggle("hidden", true);
            this.playButton.classList.toggle("hidden", true);
            this.pauseButton.classList.toggle("hidden", false);
            this.canvas.classList.toggle("hidden", false);
        };
        this.pauseButton.onclick = () => {
            engine.setPaused(true);
            this.playMenuDiv.classList.toggle("hidden", false);
            this.playButton.classList.toggle("hidden", false);
            this.pauseButton.classList.toggle("hidden", true);
            this.canvas.classList.toggle("hidden", true);
        };
        this.reloadButton.onclick = () => {
            this.game = gameProvider();
            engine.play(this.game);
            engine.setPaused(false);
            this.updatePlayer();
        };
        this.urlButton.onclick = () => {
            const gameUrl = (0,_pack__WEBPACK_IMPORTED_MODULE_2__.gameToUrl)(this.game);
            try {
                navigator.share({ url: gameUrl });
            }
            catch (error) {
                try {
                    navigator.clipboard.writeText(gameUrl);
                }
                catch (error) {
                    console.error("Failed to share URL");
                }
            }
        };
        this.qrButton.onclick = () => {
            this.qrCanvas.toBlob((blob) => {
                if (blob === null) {
                    throw "Blob was null, failed to share QR code";
                }
                try {
                    const files = [new File([blob], 'qr.png', { type: blob.type })];
                    navigator.share({ files: files });
                }
                catch (error) {
                    try {
                        const item = new ClipboardItem({ "image/png": blob });
                        navigator.clipboard.write([item]);
                    }
                    catch (error) {
                        console.error("Failed to share QR code");
                    }
                }
            });
        };
        this.openEditorButton.onclick = () => {
            window.location.href = (0,_pack__WEBPACK_IMPORTED_MODULE_2__.gameToUrl)(this.game, "edit");
        };
        this.closeEditorButton.onclick = () => {
            window.location.href = (0,_pack__WEBPACK_IMPORTED_MODULE_2__.gameToUrl)(this.game, "play");
        };
    }
    updatePlayer() {
        const qrGenerateOptions = {
            minCorrectionLevel: lean_qr__WEBPACK_IMPORTED_MODULE_0__.correction.L
        };
        const qrImageOptions = {
            on: [0, 0, 0, 255],
            off: [255, 255, 255, 255],
            pad: 1,
        };
        (0,lean_qr__WEBPACK_IMPORTED_MODULE_0__.generate)((0,_pack__WEBPACK_IMPORTED_MODULE_2__.gameToUrl)(this.game), qrGenerateOptions).toCanvas(this.qrCanvas, qrImageOptions);
        this.gameTitle.innerText = this.game.metadata.title;
        this.gameDescription.innerText = this.game.metadata.description;
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ },

/***/ "./render.ts"
/*!*******************!*\
  !*** ./render.ts ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _chars_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chars.png */ "./chars.png");
/* harmony import */ var _chars_txt__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chars.txt */ "./chars.txt");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./constants.ts");
/* harmony import */ var _shaders_sprite_vert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/sprite.vert */ "./shaders/sprite.vert");
/* harmony import */ var _shaders_sprite_frag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shaders/sprite.frag */ "./shaders/sprite.frag");
/* harmony import */ var _shaders_line_vert__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shaders/line.vert */ "./shaders/line.vert");
/* harmony import */ var _shaders_line_frag__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./shaders/line.frag */ "./shaders/line.frag");




let spriteSheet = new Image();
spriteSheet.src = _chars_png__WEBPACK_IMPORTED_MODULE_0__;
let spriteSheetData = {};
let lines = _chars_txt__WEBPACK_IMPORTED_MODULE_1__.split('\n');
for (let i = 0; i < lines.length; i++) {
    let l = lines[i].split(',');
    spriteSheetData[parseInt(l[0])] = {
        index: i,
        isFullWidth: parseInt(l[1]) > 0
    };
}
const GL = WebGL2RenderingContext;
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = gl.createShader(GL.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, GL.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        console.log(`Failed to compile vertex shader: ${errorMessage}`);
        return null;
    }
    const fragmentShader = gl.createShader(GL.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, GL.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        console.log(`Failed to compile fragment shader: ${errorMessage}`);
        return null;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, GL.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(program);
        console.log(`Failed to link GPU program: ${errorMessage}`);
        return null;
    }
    return program;
}
function createTexture(gl, image) {
    const texture = gl.createTexture();
    gl.bindTexture(GL.TEXTURE_2D, texture);
    gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    gl.bindTexture(GL.TEXTURE_2D, null);
    return texture;
}


class SpritePipeline {
    #program;
    #vPositionLoc;
    #vTexCoordLoc;
    #iOffsetLoc;
    #iBackColorLoc;
    #iFrontColorLoc;
    #iTexIndexLoc;
    #iHalfWidth;
    #uView;
    #vao;
    #numInstances;
    #instanceStride;
    #numVertices;
    #instanceBuffer;
    #instanceData;
    #texture;
    constructor(gl) {
        this.#program = createProgram(gl, _shaders_sprite_vert__WEBPACK_IMPORTED_MODULE_3__, _shaders_sprite_frag__WEBPACK_IMPORTED_MODULE_4__);
        // Shader Locations
        this.#vPositionLoc = gl.getAttribLocation(this.#program, 'vPosition');
        this.#vTexCoordLoc = gl.getAttribLocation(this.#program, 'vTexCoord');
        this.#iOffsetLoc = gl.getAttribLocation(this.#program, 'iOffset');
        this.#iBackColorLoc = gl.getAttribLocation(this.#program, 'iBackColor');
        this.#iFrontColorLoc = gl.getAttribLocation(this.#program, 'iFrontColor');
        this.#iTexIndexLoc = gl.getAttribLocation(this.#program, 'iTexIndex');
        this.#iHalfWidth = gl.getAttribLocation(this.#program, 'iHalfWidth');
        this.#uView = gl.getUniformLocation(this.#program, 'uView');
        // Make VAO
        this.#vao = gl.createVertexArray();
        gl.bindVertexArray(this.#vao);
        this.#numVertices = 6;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 16,
            0, 0,
            16, 0,
            0, 16,
            16, 0,
            16, 16,
        ]), GL.STATIC_DRAW);
        gl.enableVertexAttribArray(this.#vPositionLoc);
        gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, 0, 0);
        // Position Buffer
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            0, 1,
            0, 0,
            1, 0,
            0, 1,
            1, 0,
            1, 1,
        ]), GL.STATIC_DRAW);
        gl.enableVertexAttribArray(this.#vTexCoordLoc);
        gl.vertexAttribPointer(this.#vTexCoordLoc, 2, GL.FLOAT, false, 0, 0);
        // Sprite Buffer
        //vec4 iBackColor; 16 bytes
        //vec4 iFrontColor; 16 bytes
        //vec2 iOffset; 8 bytes
        //float iTexIndex; 4 byte
        //float pad; 4 bytes
        this.#instanceStride = 12;
        this.#numInstances = 0;
        this.#instanceBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        this.#instanceData = new Float32Array(this.#instanceStride * 16384);
        gl.bufferData(GL.ARRAY_BUFFER, this.#instanceData, GL.DYNAMIC_DRAW);
        const BPE = Float32Array.BYTES_PER_ELEMENT; // Bytes per element
        gl.enableVertexAttribArray(this.#iBackColorLoc);
        gl.enableVertexAttribArray(this.#iFrontColorLoc);
        gl.enableVertexAttribArray(this.#iOffsetLoc);
        gl.enableVertexAttribArray(this.#iTexIndexLoc);
        gl.enableVertexAttribArray(this.#iHalfWidth);
        gl.vertexAttribPointer(this.#iBackColorLoc, 4, GL.FLOAT, true, this.#instanceStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#iFrontColorLoc, 4, GL.FLOAT, true, this.#instanceStride * BPE, 4 * BPE);
        gl.vertexAttribPointer(this.#iOffsetLoc, 2, GL.FLOAT, false, this.#instanceStride * BPE, 8 * BPE);
        gl.vertexAttribPointer(this.#iTexIndexLoc, 1, GL.FLOAT, false, this.#instanceStride * BPE, 10 * BPE);
        gl.vertexAttribPointer(this.#iHalfWidth, 1, GL.FLOAT, false, this.#instanceStride * BPE, 11 * BPE);
        gl.vertexAttribDivisor(this.#iBackColorLoc, 1);
        gl.vertexAttribDivisor(this.#iFrontColorLoc, 1);
        gl.vertexAttribDivisor(this.#iOffsetLoc, 1);
        gl.vertexAttribDivisor(this.#iTexIndexLoc, 1);
        gl.vertexAttribDivisor(this.#iHalfWidth, 1);
        // Draw
        let that = this;
        this.#texture = createTexture(gl, spriteSheet);
        spriteSheet.decode().then(function () {
            that.#texture = createTexture(gl, spriteSheet);
        });
    }
    addData(x, y, color, codepoint, compact = false) {
        let start = this.#numInstances * this.#instanceStride;
        let values = _constants__WEBPACK_IMPORTED_MODULE_2__.PALETTE_FRACTIONS[color % 8];
        if (color >= 8) {
            this.#instanceData.set([values[0], values[1], values[2], 1, 0, 0, 0, 0], start);
        }
        else {
            this.#instanceData.set([0, 0, 0, 0, values[0], values[1], values[2], 1], start);
        }
        start += 8;
        if (!(codepoint in spriteSheetData)) {
            codepoint = 0; // NUL character
        }
        const data = spriteSheetData[codepoint];
        const isFullWidth = !compact || data.isFullWidth;
        this.#instanceData.set([x, y, data.index, isFullWidth ? 0.0 : 1.0], start);
        this.#numInstances++;
    }
    draw(gl, view) {
        if (this.#numInstances === 0) {
            return;
        }
        // Shaders
        gl.useProgram(this.#program);
        gl.uniform4fv(this.#uView, view);
        gl.bindTexture(GL.TEXTURE_2D, this.#texture);
        // Attributes
        gl.bindVertexArray(this.#vao);
        // Instance Data
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#instanceBuffer);
        gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.#instanceData, 0, this.#numInstances * this.#instanceStride * Float32Array.BYTES_PER_ELEMENT);
        // Draw
        gl.drawArraysInstanced(GL.TRIANGLES, 0, this.#numVertices, this.#numInstances);
        this.#numInstances = 0;
    }
}


class LinePipeline {
    #program;
    #vColorLoc;
    #vPositionLoc;
    #vOffsetLoc;
    #uViewLoc;
    #uLinePatternLoc;
    #vao;
    #vertexStride;
    #numVertices;
    #vertexBuffer;
    #vertexData;
    constructor(gl) {
        this.#program = createProgram(gl, _shaders_line_vert__WEBPACK_IMPORTED_MODULE_5__, _shaders_line_frag__WEBPACK_IMPORTED_MODULE_6__);
        // Shader Locations
        this.#vPositionLoc = gl.getAttribLocation(this.#program, 'vPosition');
        this.#vColorLoc = gl.getAttribLocation(this.#program, 'vColor');
        this.#vOffsetLoc = gl.getAttribLocation(this.#program, 'vOffset');
        this.#uViewLoc = gl.getUniformLocation(this.#program, 'uView');
        this.#uLinePatternLoc = gl.getUniformLocation(this.#program, 'uLinePattern');
        // Make VAO
        this.#vao = gl.createVertexArray();
        gl.bindVertexArray(this.#vao);
        this.#vertexStride = 8;
        this.#numVertices = 0;
        this.#vertexBuffer = gl.createBuffer();
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#vertexBuffer);
        this.#vertexData = new Float32Array(this.#vertexStride * 16384);
        gl.bufferData(GL.ARRAY_BUFFER, this.#vertexData, GL.DYNAMIC_DRAW);
        const BPE = Float32Array.BYTES_PER_ELEMENT; // Bytes per element
        gl.enableVertexAttribArray(this.#vColorLoc);
        gl.enableVertexAttribArray(this.#vPositionLoc);
        gl.enableVertexAttribArray(this.#vOffsetLoc);
        gl.vertexAttribPointer(this.#vColorLoc, 4, GL.FLOAT, true, this.#vertexStride * BPE, 0 * BPE);
        gl.vertexAttribPointer(this.#vPositionLoc, 2, GL.FLOAT, false, this.#vertexStride * BPE, 4 * BPE);
        gl.vertexAttribPointer(this.#vOffsetLoc, 1, GL.FLOAT, false, this.#vertexStride * BPE, 6 * BPE);
    }
    addData(x, y, r, g, b, a, offset) {
        let start = this.#numVertices * this.#vertexStride;
        this.#vertexData.set([r, g, b, a, x, y, offset, 0], start);
        this.#numVertices++;
    }
    draw(gl, view, pattern) {
        if (this.#numVertices === 0) {
            return;
        }
        // Shaders
        gl.useProgram(this.#program);
        gl.uniform4fv(this.#uViewLoc, view);
        gl.uniform3fv(this.#uLinePatternLoc, [pattern.offset, pattern.interval, pattern.dashLength]);
        // Attributes
        gl.bindVertexArray(this.#vao);
        // Instance Data
        gl.bindBuffer(GL.ARRAY_BUFFER, this.#vertexBuffer);
        gl.bufferSubData(GL.ARRAY_BUFFER, 0, this.#vertexData, 0, this.#numVertices * this.#vertexStride * Float32Array.BYTES_PER_ELEMENT);
        // Draw
        gl.drawArrays(GL.LINES, 0, this.#numVertices);
        this.#numVertices = 0;
    }
}
class Renderer {
    #gl;
    #previousTimestamp;
    #frameCallback;
    #spritePipeline;
    #linePipeline;
    paused;
    renderTime;
    viewOffset;
    constructor(canvas) {
        this.#gl = canvas.getContext("webgl2", { premultipliedAlpha: false }); //{ antialias: false }
        this.#gl.enable(GL.BLEND);
        this.#gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
        this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);
        this.#gl.clearColor(0, 0, 0, 1);
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        this.#spritePipeline = new SpritePipeline(this.#gl);
        this.#linePipeline = new LinePipeline(this.#gl);
        this.paused = false;
        this.renderTime = 0;
        this.viewOffset = { x: 0, y: 0 };
    }
    startRenderLoop(frameCallback) {
        this.#frameCallback = frameCallback;
        requestAnimationFrame((t) => this.#renderFrame(t));
    }
    #renderFrame(timestamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        if (this.#gl.canvas.checkVisibility() && !this.paused) {
            const elapsed = timestamp - this.#previousTimestamp;
            if (elapsed >= _constants__WEBPACK_IMPORTED_MODULE_2__.FRAME_TIME_MS) {
                this.#frameCallback();
                this.renderTime += _constants__WEBPACK_IMPORTED_MODULE_2__.FRAME_TIME;
                if (elapsed > _constants__WEBPACK_IMPORTED_MODULE_2__.FRAME_TIME_MS * 5) {
                    console.log("Elapsed time is large, skipping frames");
                    this.#previousTimestamp = timestamp;
                }
                else {
                    this.#previousTimestamp += _constants__WEBPACK_IMPORTED_MODULE_2__.FRAME_TIME_MS;
                }
            }
        }
        else {
            this.#previousTimestamp = timestamp;
        }
        requestAnimationFrame((t) => this.#renderFrame(t));
    }
    beginFrame() {
        this.#gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    }
    endFrame() {
        const viewData = [this.viewOffset.x, this.viewOffset.y, this.#gl.canvas.width, this.#gl.canvas.height];
        this.#spritePipeline.draw(this.#gl, viewData);
        this.#linePipeline.draw(this.#gl, viewData, { offset: this.renderTime * 4.0, interval: 4, dashLength: 2 });
        this.#gl.flush();
    }
    drawCharacters(codePoints, colors, posX, posY, pivotX, pivotY, wrap, compact) {
        console.assert(codePoints.length == colors.length);
        // Find layout
        let offsets = [];
        let offsetX = 0;
        let offsetY = 0;
        for (let i = 0; i < codePoints.length; i++) {
            let codepoint = codePoints[i];
            if (!(codepoint in spriteSheetData)) {
                codepoint = 0; // NUL character
            }
            const data = spriteSheetData[codepoint];
            const isFullWidth = !compact || data.isFullWidth;
            const width = isFullWidth ? _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH : _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH / 2;
            if (wrap > 0 && offsetX + width > wrap * _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH) {
                offsetX = 0;
                offsetY += _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH;
            }
            offsets.push({ x: offsetX, y: offsetY });
            // Update offset
            offsetX += width;
        }
        // Calc width and height
        let width = wrap > 0 ? wrap * _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH : offsetX;
        let height = codePoints.length > 0 ? offsetY + _constants__WEBPACK_IMPORTED_MODULE_2__.CHAR_WIDTH : 0;
        // Draw
        let roundedX = Math.round(posX - width * pivotX);
        let roundedY = Math.round(posY - height * pivotY);
        for (let i = 0; i < codePoints.length; i++) {
            let offset = offsets[i];
            this.#spritePipeline.addData(roundedX + offset.x, roundedY + offset.y, colors[i], codePoints[i], compact);
        }
    }
    drawBox(x0, y0, x1, y1, margin) {
        x0 -= margin;
        y0 -= margin;
        x1 += margin;
        y1 += margin;
        let totalOffset = 0;
        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(x0 - x1);
        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1, totalOffset);
        this.#linePipeline.addData(x1, y0, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(y0 - y1);
        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1, totalOffset);
        this.#linePipeline.addData(x1, y1, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(x0 - x1);
        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1, totalOffset);
        this.#linePipeline.addData(x0, y1, 1, 1, 1, 1, totalOffset);
        totalOffset += Math.abs(y0 - y1);
        this.#linePipeline.addData(x0, y0, 1, 1, 1, 1, totalOffset);
    }
    drawGrid(x0, y0, x1, y1, xTiles, yTiles) {
        x0 += 0.5;
        y0 += 0.5;
        x1 += 0.5;
        y1 += 0.5;
        const yIncrement = (y1 - y0) / yTiles;
        for (let i = 1; i < yTiles; i++) {
            const yOffset = y0 + yIncrement * i;
            this.#linePipeline.addData(x0, yOffset, 0, 0.5, 1, 0.5, 0);
            this.#linePipeline.addData(x1, yOffset, 0, 0.5, 1, 0.5, x1 - x0);
        }
        const xIncrement = (x1 - x0) / xTiles;
        for (let i = 1; i < xTiles; i++) {
            const xOffset = x0 + xIncrement * i;
            this.#linePipeline.addData(xOffset, y0, 0, 0.5, 1, 0.5, 0);
            this.#linePipeline.addData(xOffset, y1, 0, 0.5, 1, 0.5, y1 - y0);
        }
    }
}


/***/ },

/***/ "./sprite.ts"
/*!*******************!*\
  !*** ./sprite.ts ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sprite: () => (/* binding */ Sprite)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./constants.ts");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! matter-js */ "../node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_1__);


class Sprite {
    char;
    color;
    wrap;
    compact;
    tap;
    #x;
    #y;
    #px;
    #py;
    #physBody;
    #physWidth;
    #physHeight;
    #physIsStatic;
    #physIsSensor;
    #physIsDrag;
    #physBounce;
    #physVelX;
    #physVelY;
    #physWantsBody;
    #physWantsWidth;
    #physWantsHeight;
    constructor(char, color, x, y) {
        this.char = char;
        this.color = color;
        this.#x = x;
        this.#y = y;
        this.#px = 0.5;
        this.#py = 0.5;
        this.wrap = 0;
        this.compact = true;
        this.#physBody = null;
        this.#physWidth = _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH;
        this.#physHeight = _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH;
        this.#physBounce = false;
        this.#physIsStatic = false;
        this.#physIsSensor = false;
        this.#physIsDrag = false;
        this.#physVelX = null;
        this.#physVelY = null;
        this.#physWantsBody = false;
        this.#physWantsWidth = _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH;
        this.#physWantsHeight = _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH;
    }
    static Copy(sprite) {
        let s = new Sprite(sprite.char, sprite.color, sprite.x, sprite.y);
        s.px = sprite.px;
        s.py = sprite.py;
        s.wrap = sprite.wrap;
        s.compact = sprite.compact;
        s.physics = sprite.physics;
        s.static = sprite.static;
        s.sensor = sprite.sensor;
        s.drag = sprite.drag;
        s.width = sprite.width;
        s.height = sprite.height;
        // not doing velocity for now
        return s;
    }
    #getBodyX() {
        return this.#x - _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * this.#px + _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * 0.5;
    }
    #getBodyY() {
        return this.#y - _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * this.#py + _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * 0.5;
    }
    set x(value) {
        this.#x = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_1__.Body.setPosition(this.#physBody, { x: this.#getBodyX(), y: this.#getBodyY() });
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get x() {
        return this.#x;
    }
    set y(value) {
        this.#y = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_1__.Body.setPosition(this.#physBody, { x: this.#getBodyX(), y: this.#getBodyY() });
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get y() {
        return this.#y;
    }
    // Set Pivot
    set px(value) {
        this.#px = value;
    }
    get px() {
        return this.#px;
    }
    set py(value) {
        this.#py = value;
    }
    get py() {
        return this.#py;
    }
    // Physics
    set physics(value) {
        this.#physWantsBody = value;
    }
    get physics() {
        return this.#physWantsBody;
    }
    set static(value) {
        this.#physIsStatic = value;
        if (this.#physBody) {
            this.#physBody.isStatic = value;
        }
    }
    get static() {
        return this.#physIsStatic;
    }
    set sensor(value) {
        this.#physIsSensor = value;
        if (this.#physBody) {
            this.#physBody.isSensor = value;
        }
    }
    get sensor() {
        return this.#physIsSensor;
    }
    set drag(value) {
        this.#physIsDrag = value;
    }
    get drag() {
        return this.#physIsDrag;
    }
    set bounce(value) {
        this.#physBounce = value;
        if (this.#physBody) {
            this.#physBody.restitution = value ? 1.0 : 1.0;
        }
    }
    get bounce() {
        return this.#physBounce;
    }
    set velX(value) {
        this.#physVelX = value;
    }
    get velX() {
        if (this.#physWantsBody === true) {
            if (this.#physVelX !== null) {
                return this.#physVelX;
            }
            if (this.#physBody !== null) {
                return this.#physBody.velocity.x;
            }
        }
        return 0;
    }
    set velY(value) {
        this.#physVelY = value;
    }
    get velY() {
        if (this.#physWantsBody === true) {
            if (this.#physVelY !== null) {
                return this.#physVelY;
            }
            if (this.#physBody !== null) {
                return this.#physBody.velocity.y;
            }
        }
        return 0;
    }
    set width(value) {
        this.#physWantsWidth = value;
    }
    get width() {
        return this.#physWantsWidth;
    }
    set height(value) {
        this.#physWantsHeight = value;
    }
    get height() {
        return this.#physWantsHeight;
    }
    prePhysicsUpdate(matterEngine) {
        // Remove body if wanted or width/height is wrong
        if (this.#physBody !== null && (!this.#physWantsBody || this.#physWantsWidth !== this.#physWidth || this.#physWantsHeight !== this.#physHeight)) {
            // Destroy body
            matter_js__WEBPACK_IMPORTED_MODULE_1__.Composite.remove(matterEngine.world, this.#physBody);
            this.#physBody = null;
        }
        // Check if the body needs to be created
        if (this.#physWantsBody && this.#physBody === null) {
            // Create Body
            const options = {
                inertia: Infinity, // Prevent rotation
                restitution: this.#physBounce ? 1.0 : 0.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: this.#physIsSensor,
                isStatic: this.#physIsStatic,
                plugin: { sprite: this }
            };
            this.#physBody = matter_js__WEBPACK_IMPORTED_MODULE_1__.Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), this.#physWantsWidth, this.#physWantsHeight, options);
            this.#physWidth = this.#physWantsWidth;
            this.#physHeight = this.#physWantsHeight;
            matter_js__WEBPACK_IMPORTED_MODULE_1__.Composite.add(matterEngine.world, this.#physBody);
        }
        if (this.#physBody) {
            if (this.#physVelX !== null || this.#physVelY !== null) {
                if (this.#physVelX === null) {
                    this.#physVelX = this.#physBody.velocity.x;
                }
                if (this.#physVelY === null) {
                    this.#physVelY = this.#physBody.velocity.y;
                }
                const newVel = { x: this.#physVelX, y: this.#physVelY };
                matter_js__WEBPACK_IMPORTED_MODULE_1__.Body.setVelocity(this.#physBody, newVel);
            }
        }
        this.#physVelX = null;
        this.#physVelY = null;
    }
    postPhysicsUpdate(matterEngine) {
        if (this.#physBody) {
            this.#x = this.#physBody.position.x + _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * this.#px - _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * 0.5;
            this.#y = this.#physBody.position.y + _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * this.#py - _constants__WEBPACK_IMPORTED_MODULE_0__.CHAR_WIDTH * 0.5;
        }
    }
    draw(renderer) {
        const codePoints = [...this.char].map(c => c.codePointAt(0) ?? 0);
        renderer.drawCharacters(codePoints, new Array(codePoints.length).fill(this.color), this.#x, this.#y, this.#px, this.#py, this.wrap, this.compact);
    }
}


/***/ },

/***/ "./chars.png"
/*!*******************!*\
  !*** ./chars.png ***!
  \*******************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "8ab9f6a5f4328a5e0cae.png";

/***/ },

/***/ "./press-play.png"
/*!************************!*\
  !*** ./press-play.png ***!
  \************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "c2d13a665429ea85e8de.png";

/***/ },

/***/ "./chars.txt"
/*!*******************!*\
  !*** ./chars.txt ***!
  \*******************/
(module) {

"use strict";
module.exports = "0,1\r\n1,1\r\n2,1\r\n3,1\r\n4,1\r\n5,1\r\n6,1\r\n7,1\r\n8,1\r\n9,1\r\n10,1\r\n11,1\r\n12,1\r\n13,1\r\n14,1\r\n15,1\r\n16,1\r\n17,1\r\n18,1\r\n19,1\r\n20,1\r\n21,1\r\n22,1\r\n23,1\r\n24,1\r\n25,1\r\n26,1\r\n27,1\r\n28,1\r\n29,1\r\n30,1\r\n31,1\r\n32,0\r\n33,0\r\n34,0\r\n35,0\r\n36,0\r\n37,0\r\n38,0\r\n39,0\r\n40,0\r\n41,0\r\n42,0\r\n43,0\r\n44,0\r\n45,0\r\n46,0\r\n47,0\r\n48,0\r\n49,0\r\n50,0\r\n51,0\r\n52,0\r\n53,0\r\n54,0\r\n55,0\r\n56,0\r\n57,0\r\n58,0\r\n59,0\r\n60,0\r\n61,0\r\n62,0\r\n63,0\r\n64,0\r\n65,0\r\n66,0\r\n67,0\r\n68,0\r\n69,0\r\n70,0\r\n71,0\r\n72,0\r\n73,0\r\n74,0\r\n75,0\r\n76,0\r\n77,0\r\n78,0\r\n79,0\r\n80,0\r\n81,0\r\n82,0\r\n83,0\r\n84,0\r\n85,0\r\n86,0\r\n87,0\r\n88,0\r\n89,0\r\n90,0\r\n91,0\r\n92,0\r\n93,0\r\n94,0\r\n95,0\r\n96,0\r\n97,0\r\n98,0\r\n99,0\r\n100,0\r\n101,0\r\n102,0\r\n103,0\r\n104,0\r\n105,0\r\n106,0\r\n107,0\r\n108,0\r\n109,0\r\n110,0\r\n111,0\r\n112,0\r\n113,0\r\n114,0\r\n115,0\r\n116,0\r\n117,0\r\n118,0\r\n119,0\r\n120,0\r\n121,0\r\n122,0\r\n123,0\r\n124,0\r\n125,0\r\n126,0\r\n127,1\r\n128,1\r\n129,1\r\n130,1\r\n131,1\r\n132,1\r\n133,1\r\n134,1\r\n135,1\r\n136,1\r\n137,1\r\n138,1\r\n139,1\r\n140,1\r\n141,1\r\n142,1\r\n143,1\r\n144,1\r\n145,1\r\n146,1\r\n147,1\r\n148,1\r\n149,1\r\n150,1\r\n151,1\r\n152,1\r\n153,1\r\n154,1\r\n155,1\r\n156,1\r\n157,1\r\n158,1\r\n159,1\r\n160,0\r\n161,0\r\n162,0\r\n163,0\r\n164,0\r\n165,0\r\n166,0\r\n167,0\r\n168,0\r\n169,0\r\n170,0\r\n171,0\r\n172,0\r\n173,1\r\n174,0\r\n175,0\r\n176,0\r\n177,0\r\n178,0\r\n179,0\r\n180,0\r\n181,0\r\n182,0\r\n183,0\r\n184,0\r\n185,0\r\n186,0\r\n187,0\r\n188,0\r\n189,0\r\n190,0\r\n191,0\r\n192,0\r\n193,0\r\n194,0\r\n195,0\r\n196,0\r\n197,0\r\n198,0\r\n199,0\r\n200,0\r\n201,0\r\n202,0\r\n203,0\r\n204,0\r\n205,0\r\n206,0\r\n207,0\r\n208,0\r\n209,0\r\n210,0\r\n211,0\r\n212,0\r\n213,0\r\n214,0\r\n215,0\r\n216,0\r\n217,0\r\n218,0\r\n219,0\r\n220,0\r\n221,0\r\n222,0\r\n223,0\r\n224,0\r\n225,0\r\n226,0\r\n227,0\r\n228,0\r\n229,0\r\n230,0\r\n231,0\r\n232,0\r\n233,0\r\n234,0\r\n235,0\r\n236,0\r\n237,0\r\n238,0\r\n239,0\r\n240,0\r\n241,0\r\n242,0\r\n243,0\r\n244,0\r\n245,0\r\n246,0\r\n247,0\r\n248,0\r\n249,0\r\n250,0\r\n251,0\r\n252,0\r\n253,0\r\n254,0\r\n255,0\r\n880,0\r\n881,0\r\n882,0\r\n883,0\r\n884,0\r\n885,0\r\n886,0\r\n887,0\r\n890,0\r\n891,0\r\n892,0\r\n893,0\r\n894,0\r\n895,0\r\n900,0\r\n901,0\r\n902,0\r\n903,0\r\n904,0\r\n905,0\r\n906,0\r\n908,0\r\n910,0\r\n911,0\r\n912,0\r\n913,0\r\n914,0\r\n915,0\r\n916,0\r\n917,0\r\n918,0\r\n919,0\r\n920,0\r\n921,0\r\n922,0\r\n923,0\r\n924,0\r\n925,0\r\n926,0\r\n927,0\r\n928,0\r\n929,0\r\n931,0\r\n932,0\r\n933,0\r\n934,0\r\n935,0\r\n936,0\r\n937,0\r\n938,0\r\n939,0\r\n940,0\r\n941,0\r\n942,0\r\n943,0\r\n944,0\r\n945,0\r\n946,0\r\n947,0\r\n948,0\r\n949,0\r\n950,0\r\n951,0\r\n952,0\r\n953,0\r\n954,0\r\n955,0\r\n956,0\r\n957,0\r\n958,0\r\n959,0\r\n960,0\r\n961,0\r\n962,0\r\n963,0\r\n964,0\r\n965,0\r\n966,0\r\n967,0\r\n968,0\r\n969,0\r\n970,0\r\n971,0\r\n972,0\r\n973,0\r\n974,0\r\n975,0\r\n976,0\r\n977,0\r\n978,0\r\n979,0\r\n980,0\r\n981,0\r\n982,0\r\n983,0\r\n984,0\r\n985,0\r\n986,0\r\n987,0\r\n988,0\r\n989,0\r\n990,0\r\n991,0\r\n992,0\r\n993,0\r\n994,0\r\n995,0\r\n996,0\r\n997,0\r\n998,0\r\n999,0\r\n1000,0\r\n1001,0\r\n1002,0\r\n1003,0\r\n1004,0\r\n1005,0\r\n1006,0\r\n1007,0\r\n1008,0\r\n1009,0\r\n1010,0\r\n1011,0\r\n1012,0\r\n1013,0\r\n1014,0\r\n1015,0\r\n1016,0\r\n1017,0\r\n1018,0\r\n1019,0\r\n1020,0\r\n1021,0\r\n1022,0\r\n1023,0\r\n5792,0\r\n5793,0\r\n5794,0\r\n5795,0\r\n5796,0\r\n5797,0\r\n5798,0\r\n5799,0\r\n5800,0\r\n5801,0\r\n5802,0\r\n5803,0\r\n5804,0\r\n5805,0\r\n5806,0\r\n5807,0\r\n5808,0\r\n5809,0\r\n5810,0\r\n5811,0\r\n5812,0\r\n5813,0\r\n5814,0\r\n5815,0\r\n5816,0\r\n5817,0\r\n5818,0\r\n5819,0\r\n5820,0\r\n5821,0\r\n5822,0\r\n5823,0\r\n5824,0\r\n5825,0\r\n5826,0\r\n5827,0\r\n5828,0\r\n5829,0\r\n5830,0\r\n5831,0\r\n5832,0\r\n5833,0\r\n5834,0\r\n5835,0\r\n5836,0\r\n5837,0\r\n5838,0\r\n5839,0\r\n5840,0\r\n5841,0\r\n5842,0\r\n5843,0\r\n5844,0\r\n5845,0\r\n5846,0\r\n5847,0\r\n5848,0\r\n5849,0\r\n5850,0\r\n5851,0\r\n5852,0\r\n5853,0\r\n5854,0\r\n5855,0\r\n5856,1\r\n5857,0\r\n5858,1\r\n5859,0\r\n5860,0\r\n5861,0\r\n5862,0\r\n5863,0\r\n5864,0\r\n5865,0\r\n5866,0\r\n5867,0\r\n5868,0\r\n5869,0\r\n5870,0\r\n5871,0\r\n5872,0\r\n5873,0\r\n5874,0\r\n5875,0\r\n5876,0\r\n5877,0\r\n5878,0\r\n5879,0\r\n5880,0\r\n8252,0\r\n8265,0\r\n8448,0\r\n8449,0\r\n8450,0\r\n8451,0\r\n8452,0\r\n8453,0\r\n8454,0\r\n8455,0\r\n8456,0\r\n8457,0\r\n8458,1\r\n8459,1\r\n8460,0\r\n8461,0\r\n8462,0\r\n8463,0\r\n8464,1\r\n8465,0\r\n8466,1\r\n8467,0\r\n8468,0\r\n8469,0\r\n8470,0\r\n8471,0\r\n8472,0\r\n8473,0\r\n8474,0\r\n8475,1\r\n8476,0\r\n8477,0\r\n8478,0\r\n8479,0\r\n8480,0\r\n8481,0\r\n8482,0\r\n8483,0\r\n8484,0\r\n8485,0\r\n8486,0\r\n8487,0\r\n8488,0\r\n8489,0\r\n8490,0\r\n8491,0\r\n8492,1\r\n8493,0\r\n8494,0\r\n8495,0\r\n8496,1\r\n8497,1\r\n8498,0\r\n8499,1\r\n8500,1\r\n8501,0\r\n8502,0\r\n8503,0\r\n8504,0\r\n8505,0\r\n8506,1\r\n8507,1\r\n8508,1\r\n8509,1\r\n8510,0\r\n8511,1\r\n8512,1\r\n8513,0\r\n8514,0\r\n8515,0\r\n8516,0\r\n8517,1\r\n8518,1\r\n8519,1\r\n8520,1\r\n8521,1\r\n8522,0\r\n8523,0\r\n8524,1\r\n8525,0\r\n8526,0\r\n8527,1\r\n8592,0\r\n8593,0\r\n8594,0\r\n8595,0\r\n8596,0\r\n8597,0\r\n8598,0\r\n8599,0\r\n8600,0\r\n8601,0\r\n8602,0\r\n8603,0\r\n8604,1\r\n8605,1\r\n8606,0\r\n8607,0\r\n8608,0\r\n8609,0\r\n8610,0\r\n8611,0\r\n8612,0\r\n8613,0\r\n8614,0\r\n8615,0\r\n8616,0\r\n8617,0\r\n8618,0\r\n8619,0\r\n8620,0\r\n8621,0\r\n8622,0\r\n8623,0\r\n8624,0\r\n8625,0\r\n8626,0\r\n8627,0\r\n8628,0\r\n8629,0\r\n8630,0\r\n8631,0\r\n8632,0\r\n8633,0\r\n8634,0\r\n8635,0\r\n8636,0\r\n8637,0\r\n8638,0\r\n8639,0\r\n8640,0\r\n8641,0\r\n8642,0\r\n8643,0\r\n8644,0\r\n8645,0\r\n8646,0\r\n8647,0\r\n8648,0\r\n8649,0\r\n8650,0\r\n8651,0\r\n8652,0\r\n8653,0\r\n8654,0\r\n8655,0\r\n8656,0\r\n8657,0\r\n8658,0\r\n8659,0\r\n8660,0\r\n8661,0\r\n8662,0\r\n8663,0\r\n8664,0\r\n8665,0\r\n8666,0\r\n8667,0\r\n8668,0\r\n8669,0\r\n8670,0\r\n8671,0\r\n8672,0\r\n8673,0\r\n8674,0\r\n8675,0\r\n8676,0\r\n8677,0\r\n8678,0\r\n8679,0\r\n8680,0\r\n8681,0\r\n8682,0\r\n8683,0\r\n8684,0\r\n8685,0\r\n8686,0\r\n8687,0\r\n8688,0\r\n8689,0\r\n8690,0\r\n8691,0\r\n8692,1\r\n8693,0\r\n8694,0\r\n8695,0\r\n8696,0\r\n8697,1\r\n8698,1\r\n8699,1\r\n8700,1\r\n8701,0\r\n8702,0\r\n8703,1\r\n8986,0\r\n8987,0\r\n9000,0\r\n9096,1\r\n9167,0\r\n9193,1\r\n9194,1\r\n9195,1\r\n9196,1\r\n9197,1\r\n9198,1\r\n9199,1\r\n9200,1\r\n9201,1\r\n9202,1\r\n9203,1\r\n9208,1\r\n9209,1\r\n9210,1\r\n9410,1\r\n9632,0\r\n9633,0\r\n9634,0\r\n9635,0\r\n9636,0\r\n9637,0\r\n9638,0\r\n9639,0\r\n9640,0\r\n9641,0\r\n9642,0\r\n9643,0\r\n9644,0\r\n9645,0\r\n9646,0\r\n9647,0\r\n9648,0\r\n9649,0\r\n9650,0\r\n9651,0\r\n9652,0\r\n9653,0\r\n9654,0\r\n9655,0\r\n9656,0\r\n9657,0\r\n9658,0\r\n9659,0\r\n9660,0\r\n9661,0\r\n9662,0\r\n9663,0\r\n9664,0\r\n9665,0\r\n9666,0\r\n9667,0\r\n9668,0\r\n9669,0\r\n9670,0\r\n9671,0\r\n9672,0\r\n9673,0\r\n9674,0\r\n9675,0\r\n9676,0\r\n9677,0\r\n9678,0\r\n9679,0\r\n9680,0\r\n9681,0\r\n9682,0\r\n9683,0\r\n9684,0\r\n9685,0\r\n9686,0\r\n9687,0\r\n9688,0\r\n9689,0\r\n9690,0\r\n9691,0\r\n9692,0\r\n9693,0\r\n9694,0\r\n9695,0\r\n9696,0\r\n9697,0\r\n9698,0\r\n9699,0\r\n9700,0\r\n9701,0\r\n9702,0\r\n9703,0\r\n9704,0\r\n9705,0\r\n9706,0\r\n9707,0\r\n9708,0\r\n9709,0\r\n9710,0\r\n9711,1\r\n9712,0\r\n9713,0\r\n9714,0\r\n9715,0\r\n9716,0\r\n9717,0\r\n9718,0\r\n9719,0\r\n9720,0\r\n9721,0\r\n9722,0\r\n9723,0\r\n9724,0\r\n9725,0\r\n9726,0\r\n9727,0\r\n9728,0\r\n9729,0\r\n9730,0\r\n9731,1\r\n9732,0\r\n9733,1\r\n9735,0\r\n9736,0\r\n9737,0\r\n9738,0\r\n9739,0\r\n9740,0\r\n9741,0\r\n9742,0\r\n9743,0\r\n9744,0\r\n9745,0\r\n9746,0\r\n9748,0\r\n9749,1\r\n9750,1\r\n9751,1\r\n9752,1\r\n9753,1\r\n9754,0\r\n9755,0\r\n9756,0\r\n9757,0\r\n9758,0\r\n9759,0\r\n9760,0\r\n9761,0\r\n9762,1\r\n9763,1\r\n9764,1\r\n9765,0\r\n9766,0\r\n9767,0\r\n9768,0\r\n9769,0\r\n9770,0\r\n9771,1\r\n9772,1\r\n9773,0\r\n9774,0\r\n9775,1\r\n9776,1\r\n9777,1\r\n9778,1\r\n9779,1\r\n9780,1\r\n9781,1\r\n9782,1\r\n9783,1\r\n9784,0\r\n9785,0\r\n9786,0\r\n9787,0\r\n9788,0\r\n9789,0\r\n9790,0\r\n9791,0\r\n9792,0\r\n9793,0\r\n9794,0\r\n9795,0\r\n9796,0\r\n9797,0\r\n9798,0\r\n9799,0\r\n9800,0\r\n9801,0\r\n9802,0\r\n9803,0\r\n9804,0\r\n9805,0\r\n9806,0\r\n9807,0\r\n9808,0\r\n9809,0\r\n9810,0\r\n9811,0\r\n9812,0\r\n9813,0\r\n9814,0\r\n9815,0\r\n9816,0\r\n9817,0\r\n9818,0\r\n9819,0\r\n9820,0\r\n9821,0\r\n9822,0\r\n9823,0\r\n9824,0\r\n9825,0\r\n9826,0\r\n9827,0\r\n9828,0\r\n9829,0\r\n9830,0\r\n9831,0\r\n9832,0\r\n9833,0\r\n9834,0\r\n9835,0\r\n9836,0\r\n9837,0\r\n9838,0\r\n9839,0\r\n9840,0\r\n9841,0\r\n9842,1\r\n9843,1\r\n9844,1\r\n9845,1\r\n9846,1\r\n9847,1\r\n9848,1\r\n9849,1\r\n9850,1\r\n9851,1\r\n9852,1\r\n9853,1\r\n9854,1\r\n9855,1\r\n9856,1\r\n9857,1\r\n9858,1\r\n9859,1\r\n9860,1\r\n9861,1\r\n9872,0\r\n9873,0\r\n9874,1\r\n9875,1\r\n9876,1\r\n9877,1\r\n9878,1\r\n9879,1\r\n9880,1\r\n9881,1\r\n9882,1\r\n9883,1\r\n9884,1\r\n9885,1\r\n9886,1\r\n9887,1\r\n9888,1\r\n9889,0\r\n9890,1\r\n9891,1\r\n9892,1\r\n9893,1\r\n9894,1\r\n9895,1\r\n9896,0\r\n9897,1\r\n9898,0\r\n9899,0\r\n9900,0\r\n9901,1\r\n9902,1\r\n9903,1\r\n9904,1\r\n9905,1\r\n9906,0\r\n9907,0\r\n9908,0\r\n9909,0\r\n9910,1\r\n9911,0\r\n9912,0\r\n9913,0\r\n9914,0\r\n9915,0\r\n9916,0\r\n9917,1\r\n9918,1\r\n9919,1\r\n9920,1\r\n9921,1\r\n9922,1\r\n9923,1\r\n9924,1\r\n9925,1\r\n9926,1\r\n9927,1\r\n9928,1\r\n9929,1\r\n9930,1\r\n9931,1\r\n9932,1\r\n9933,1\r\n9934,1\r\n9935,1\r\n9936,1\r\n9937,1\r\n9938,1\r\n9939,1\r\n9940,1\r\n9941,1\r\n9942,1\r\n9943,1\r\n9944,1\r\n9945,1\r\n9946,1\r\n9947,1\r\n9948,1\r\n9949,1\r\n9950,1\r\n9951,1\r\n9952,1\r\n9953,1\r\n9954,0\r\n9955,1\r\n9956,1\r\n9957,1\r\n9958,1\r\n9959,1\r\n9960,1\r\n9961,1\r\n9962,1\r\n9963,1\r\n9964,1\r\n9965,1\r\n9966,1\r\n9967,1\r\n9968,1\r\n9969,1\r\n9970,1\r\n9971,1\r\n9972,1\r\n9973,1\r\n9974,1\r\n9975,1\r\n9976,1\r\n9977,1\r\n9978,1\r\n9979,1\r\n9980,1\r\n9981,1\r\n9982,1\r\n9983,1\r\n9984,1\r\n9985,1\r\n9986,1\r\n9987,1\r\n9988,1\r\n9989,1\r\n9992,1\r\n9993,1\r\n9994,1\r\n9995,1\r\n9996,1\r\n9997,1\r\n9998,1\r\n9999,1\r\n10000,1\r\n10001,1\r\n10002,1\r\n10004,1\r\n10006,1\r\n10013,1\r\n10017,1\r\n10024,1\r\n10035,1\r\n10036,1\r\n10052,1\r\n10055,1\r\n10060,1\r\n10062,1\r\n10067,1\r\n10068,1\r\n10069,1\r\n10071,1\r\n10083,1\r\n10084,1\r\n10085,1\r\n10086,1\r\n10087,1\r\n10133,1\r\n10134,1\r\n10135,1\r\n10145,1\r\n10160,0\r\n10175,1\r\n10548,1\r\n10549,1\r\n11008,1\r\n11009,1\r\n11010,1\r\n11011,1\r\n11012,1\r\n11013,1\r\n11014,0\r\n11015,0\r\n11016,1\r\n11017,1\r\n11018,1\r\n11019,1\r\n11020,1\r\n11021,0\r\n11022,1\r\n11023,1\r\n11024,1\r\n11025,1\r\n11026,1\r\n11027,1\r\n11028,1\r\n11029,1\r\n11030,1\r\n11031,1\r\n11032,1\r\n11033,1\r\n11034,1\r\n11035,1\r\n11036,1\r\n11037,0\r\n11038,0\r\n11039,1\r\n11040,1\r\n11041,1\r\n11042,1\r\n11043,1\r\n11044,1\r\n11045,0\r\n11046,0\r\n11047,0\r\n11048,0\r\n11049,0\r\n11050,0\r\n11051,0\r\n11052,1\r\n11053,1\r\n11054,0\r\n11055,0\r\n11056,1\r\n11057,0\r\n11058,1\r\n11059,1\r\n11060,1\r\n11061,1\r\n11062,1\r\n11063,1\r\n11064,1\r\n11065,1\r\n11066,1\r\n11067,1\r\n11068,1\r\n11069,1\r\n11070,1\r\n11071,1\r\n11072,1\r\n11073,1\r\n11074,1\r\n11075,1\r\n11076,1\r\n11077,1\r\n11078,1\r\n11079,1\r\n11080,1\r\n11081,1\r\n11082,1\r\n11083,1\r\n11084,1\r\n11085,1\r\n11086,0\r\n11087,0\r\n11088,1\r\n11089,1\r\n11090,1\r\n11091,1\r\n11092,1\r\n11093,1\r\n11094,1\r\n11095,1\r\n11096,1\r\n11097,1\r\n11098,1\r\n11099,1\r\n11100,1\r\n11101,1\r\n11102,1\r\n11103,1\r\n11104,1\r\n11105,1\r\n11106,1\r\n11107,1\r\n11108,1\r\n11109,1\r\n11110,1\r\n11111,1\r\n11112,1\r\n11113,1\r\n11114,1\r\n11115,1\r\n11116,1\r\n11117,1\r\n11118,1\r\n11119,1\r\n11120,1\r\n11121,1\r\n11122,1\r\n11123,1\r\n11126,1\r\n11127,1\r\n11128,1\r\n11129,1\r\n11130,1\r\n11131,1\r\n11132,1\r\n11133,1\r\n11134,1\r\n11135,1\r\n11136,1\r\n11137,1\r\n11138,1\r\n11139,1\r\n11140,1\r\n11141,1\r\n11142,1\r\n11143,1\r\n11144,1\r\n11145,1\r\n11146,1\r\n11147,1\r\n11148,1\r\n11149,1\r\n11150,1\r\n11151,1\r\n11152,1\r\n11153,1\r\n11154,1\r\n11155,1\r\n11156,1\r\n11157,1\r\n11159,1\r\n11160,1\r\n11161,1\r\n11162,1\r\n11163,1\r\n11164,1\r\n11165,1\r\n11166,1\r\n11167,1\r\n11168,1\r\n11169,1\r\n11170,1\r\n11171,1\r\n11172,1\r\n11173,1\r\n11174,1\r\n11175,1\r\n11176,1\r\n11177,1\r\n11178,1\r\n11179,1\r\n11180,1\r\n11181,1\r\n11182,1\r\n11183,1\r\n11184,1\r\n11185,1\r\n11186,1\r\n11187,1\r\n11188,1\r\n11189,1\r\n11190,1\r\n11191,1\r\n11192,1\r\n11193,1\r\n11194,1\r\n11195,1\r\n11196,1\r\n11197,1\r\n11198,1\r\n11199,1\r\n11200,1\r\n11201,1\r\n11202,1\r\n11203,1\r\n11204,1\r\n11205,1\r\n11206,1\r\n11207,1\r\n11208,1\r\n11209,0\r\n11210,1\r\n11211,1\r\n11212,1\r\n11213,1\r\n11214,1\r\n11215,1\r\n11216,1\r\n11217,1\r\n11218,1\r\n11219,1\r\n11220,1\r\n11221,1\r\n11222,1\r\n11223,1\r\n11224,1\r\n11225,1\r\n11226,1\r\n11227,1\r\n11228,1\r\n11229,1\r\n11230,1\r\n11231,1\r\n11232,1\r\n11233,1\r\n11234,1\r\n11235,1\r\n11236,1\r\n11237,1\r\n11238,1\r\n11239,1\r\n11240,1\r\n11241,1\r\n11242,1\r\n11243,1\r\n11244,1\r\n11245,1\r\n11246,1\r\n11247,1\r\n11248,1\r\n11249,1\r\n11250,1\r\n11251,1\r\n11252,1\r\n11253,1\r\n11254,1\r\n11255,1\r\n11256,1\r\n11257,1\r\n11258,1\r\n11259,1\r\n11260,1\r\n11261,1\r\n11262,1\r\n11263,0\r\n12336,1\r\n12349,1\r\n12353,1\r\n12354,1\r\n12355,1\r\n12356,1\r\n12357,1\r\n12358,1\r\n12359,1\r\n12360,1\r\n12361,1\r\n12362,1\r\n12363,1\r\n12364,1\r\n12365,1\r\n12366,1\r\n12367,1\r\n12368,1\r\n12369,1\r\n12370,1\r\n12371,1\r\n12372,1\r\n12373,1\r\n12374,1\r\n12375,1\r\n12376,1\r\n12377,1\r\n12378,1\r\n12379,1\r\n12380,1\r\n12381,1\r\n12382,1\r\n12383,1\r\n12384,1\r\n12385,1\r\n12386,1\r\n12387,1\r\n12388,1\r\n12389,1\r\n12390,1\r\n12391,1\r\n12392,1\r\n12393,1\r\n12394,1\r\n12395,1\r\n12396,1\r\n12397,1\r\n12398,1\r\n12399,1\r\n12400,1\r\n12401,1\r\n12402,1\r\n12403,1\r\n12404,1\r\n12405,1\r\n12406,1\r\n12407,1\r\n12408,1\r\n12409,1\r\n12410,1\r\n12411,1\r\n12412,1\r\n12413,1\r\n12414,1\r\n12415,1\r\n12416,1\r\n12417,1\r\n12418,1\r\n12419,1\r\n12420,1\r\n12421,1\r\n12422,1\r\n12423,1\r\n12424,1\r\n12425,1\r\n12426,1\r\n12427,1\r\n12428,1\r\n12429,1\r\n12430,1\r\n12431,1\r\n12432,1\r\n12433,1\r\n12434,1\r\n12435,1\r\n12436,1\r\n12437,1\r\n12438,1\r\n12443,1\r\n12444,1\r\n12445,1\r\n12446,1\r\n12447,1\r\n12448,1\r\n12449,1\r\n12450,1\r\n12451,1\r\n12452,1\r\n12453,1\r\n12454,1\r\n12455,1\r\n12456,1\r\n12457,1\r\n12458,1\r\n12459,1\r\n12460,1\r\n12461,1\r\n12462,1\r\n12463,1\r\n12464,1\r\n12465,1\r\n12466,1\r\n12467,1\r\n12468,1\r\n12469,1\r\n12470,1\r\n12471,1\r\n12472,1\r\n12473,1\r\n12474,1\r\n12475,1\r\n12476,1\r\n12477,1\r\n12478,1\r\n12479,1\r\n12480,1\r\n12481,1\r\n12482,1\r\n12483,1\r\n12484,1\r\n12485,1\r\n12486,1\r\n12487,1\r\n12488,1\r\n12489,1\r\n12490,1\r\n12491,1\r\n12492,1\r\n12493,1\r\n12494,1\r\n12495,1\r\n12496,1\r\n12497,1\r\n12498,1\r\n12499,1\r\n12500,1\r\n12501,1\r\n12502,1\r\n12503,1\r\n12504,1\r\n12505,1\r\n12506,1\r\n12507,1\r\n12508,1\r\n12509,1\r\n12510,1\r\n12511,1\r\n12512,1\r\n12513,1\r\n12514,1\r\n12515,1\r\n12516,1\r\n12517,1\r\n12518,1\r\n12519,1\r\n12520,1\r\n12521,1\r\n12522,1\r\n12523,1\r\n12524,1\r\n12525,1\r\n12526,1\r\n12527,1\r\n12528,1\r\n12529,1\r\n12530,1\r\n12531,1\r\n12532,1\r\n12533,1\r\n12534,1\r\n12535,1\r\n12536,1\r\n12537,1\r\n12538,1\r\n12539,1\r\n12540,1\r\n12541,1\r\n12542,1\r\n12543,1\r\n12951,1\r\n12953,1\r\n78895,1\r\n126976,1\r\n126977,1\r\n126978,1\r\n126979,1\r\n126980,1\r\n126981,1\r\n126982,1\r\n126983,1\r\n126984,1\r\n126985,1\r\n126986,1\r\n126987,1\r\n126988,1\r\n126989,1\r\n126990,1\r\n126991,1\r\n126992,1\r\n126993,1\r\n126994,1\r\n126995,1\r\n126996,1\r\n126997,1\r\n126998,1\r\n126999,1\r\n127000,1\r\n127001,1\r\n127002,1\r\n127003,1\r\n127004,1\r\n127005,1\r\n127006,1\r\n127007,1\r\n127008,1\r\n127009,1\r\n127010,1\r\n127011,1\r\n127012,1\r\n127013,1\r\n127014,1\r\n127015,1\r\n127016,1\r\n127017,1\r\n127018,1\r\n127019,1\r\n127024,1\r\n127025,1\r\n127026,1\r\n127027,1\r\n127028,1\r\n127029,1\r\n127030,1\r\n127031,1\r\n127032,1\r\n127033,1\r\n127034,1\r\n127035,1\r\n127036,1\r\n127037,1\r\n127038,1\r\n127039,1\r\n127040,1\r\n127041,1\r\n127042,1\r\n127043,1\r\n127044,1\r\n127045,1\r\n127046,1\r\n127047,1\r\n127048,1\r\n127049,1\r\n127050,1\r\n127051,1\r\n127052,1\r\n127053,1\r\n127054,1\r\n127055,1\r\n127056,1\r\n127057,1\r\n127058,1\r\n127059,1\r\n127060,1\r\n127061,1\r\n127062,1\r\n127063,1\r\n127064,1\r\n127065,1\r\n127066,1\r\n127067,1\r\n127068,1\r\n127069,1\r\n127070,1\r\n127071,1\r\n127072,1\r\n127073,1\r\n127074,0\r\n127075,0\r\n127076,0\r\n127077,0\r\n127078,0\r\n127079,0\r\n127080,0\r\n127081,0\r\n127082,0\r\n127083,0\r\n127084,0\r\n127085,0\r\n127086,0\r\n127087,0\r\n127088,0\r\n127089,0\r\n127090,0\r\n127091,0\r\n127092,0\r\n127093,0\r\n127094,0\r\n127095,0\r\n127096,0\r\n127097,0\r\n127098,0\r\n127099,0\r\n127100,0\r\n127101,0\r\n127102,0\r\n127103,0\r\n127104,0\r\n127105,0\r\n127106,0\r\n127107,0\r\n127108,0\r\n127109,0\r\n127110,0\r\n127111,0\r\n127112,0\r\n127113,0\r\n127114,0\r\n127115,0\r\n127116,0\r\n127117,0\r\n127118,0\r\n127119,0\r\n127120,0\r\n127121,0\r\n127122,0\r\n127123,0\r\n127136,1\r\n127137,1\r\n127138,1\r\n127139,1\r\n127140,1\r\n127141,1\r\n127142,1\r\n127143,1\r\n127144,1\r\n127145,1\r\n127146,1\r\n127147,1\r\n127148,1\r\n127149,1\r\n127150,1\r\n127153,1\r\n127154,1\r\n127155,1\r\n127156,1\r\n127157,1\r\n127158,1\r\n127159,1\r\n127160,1\r\n127161,1\r\n127162,1\r\n127163,1\r\n127164,1\r\n127165,1\r\n127166,1\r\n127167,1\r\n127169,1\r\n127170,1\r\n127171,1\r\n127172,1\r\n127173,1\r\n127174,1\r\n127175,1\r\n127176,1\r\n127177,1\r\n127178,1\r\n127179,1\r\n127180,1\r\n127181,1\r\n127182,1\r\n127183,1\r\n127185,1\r\n127186,1\r\n127187,1\r\n127188,1\r\n127189,1\r\n127190,1\r\n127191,1\r\n127192,1\r\n127193,1\r\n127194,1\r\n127195,1\r\n127196,1\r\n127197,1\r\n127198,1\r\n127199,1\r\n127200,1\r\n127201,1\r\n127202,1\r\n127203,1\r\n127204,1\r\n127205,1\r\n127206,1\r\n127207,1\r\n127208,1\r\n127209,1\r\n127210,1\r\n127211,1\r\n127212,1\r\n127213,1\r\n127214,1\r\n127215,1\r\n127216,1\r\n127217,1\r\n127218,1\r\n127219,1\r\n127220,1\r\n127221,1\r\n127245,1\r\n127246,1\r\n127247,1\r\n127279,0\r\n127340,1\r\n127341,1\r\n127342,1\r\n127343,1\r\n127344,1\r\n127345,1\r\n127358,1\r\n127359,1\r\n127374,1\r\n127377,1\r\n127378,1\r\n127379,1\r\n127380,1\r\n127381,1\r\n127382,1\r\n127383,1\r\n127384,1\r\n127385,1\r\n127386,1\r\n127405,1\r\n127489,1\r\n127490,1\r\n127514,1\r\n127535,1\r\n127538,1\r\n127539,1\r\n127540,1\r\n127541,1\r\n127542,1\r\n127543,1\r\n127544,1\r\n127545,1\r\n127546,1\r\n127568,1\r\n127569,1\r\n127584,1\r\n127585,1\r\n127586,1\r\n127587,1\r\n127588,1\r\n127589,1\r\n127744,1\r\n127745,1\r\n127746,1\r\n127747,1\r\n127748,1\r\n127749,1\r\n127750,1\r\n127751,1\r\n127752,1\r\n127753,1\r\n127754,1\r\n127755,1\r\n127756,1\r\n127757,1\r\n127758,1\r\n127759,1\r\n127760,1\r\n127761,1\r\n127762,1\r\n127763,1\r\n127764,1\r\n127765,1\r\n127766,1\r\n127767,1\r\n127768,1\r\n127769,1\r\n127770,1\r\n127771,1\r\n127772,1\r\n127773,1\r\n127774,1\r\n127775,1\r\n127776,1\r\n127777,1\r\n127778,1\r\n127779,1\r\n127780,1\r\n127781,1\r\n127782,1\r\n127783,1\r\n127784,1\r\n127785,1\r\n127786,1\r\n127787,1\r\n127788,1\r\n127789,1\r\n127790,1\r\n127791,1\r\n127792,1\r\n127793,1\r\n127794,1\r\n127795,1\r\n127796,1\r\n127797,1\r\n127798,1\r\n127799,1\r\n127800,1\r\n127801,1\r\n127802,1\r\n127803,1\r\n127804,1\r\n127805,1\r\n127806,1\r\n127807,1\r\n127808,1\r\n127809,1\r\n127810,1\r\n127811,1\r\n127812,1\r\n127813,1\r\n127814,1\r\n127815,1\r\n127816,1\r\n127817,1\r\n127818,1\r\n127819,1\r\n127820,1\r\n127821,1\r\n127822,1\r\n127823,1\r\n127824,1\r\n127825,1\r\n127826,1\r\n127827,1\r\n127828,1\r\n127829,1\r\n127830,1\r\n127831,1\r\n127832,1\r\n127833,1\r\n127834,1\r\n127835,1\r\n127836,1\r\n127837,1\r\n127838,1\r\n127839,1\r\n127840,1\r\n127841,1\r\n127842,1\r\n127843,1\r\n127844,1\r\n127845,1\r\n127846,1\r\n127847,1\r\n127848,1\r\n127849,1\r\n127850,1\r\n127851,1\r\n127852,1\r\n127853,1\r\n127854,1\r\n127855,1\r\n127856,1\r\n127857,1\r\n127858,1\r\n127859,1\r\n127860,1\r\n127861,1\r\n127862,1\r\n127863,1\r\n127864,1\r\n127865,1\r\n127866,1\r\n127867,1\r\n127868,1\r\n127869,1\r\n127870,0\r\n127871,1\r\n127872,1\r\n127873,1\r\n127874,1\r\n127875,1\r\n127876,1\r\n127877,1\r\n127878,1\r\n127879,1\r\n127880,1\r\n127881,1\r\n127882,1\r\n127883,1\r\n127884,1\r\n127885,1\r\n127886,1\r\n127887,1\r\n127888,1\r\n127889,1\r\n127890,1\r\n127891,1\r\n127892,1\r\n127893,1\r\n127894,1\r\n127895,1\r\n127896,1\r\n127897,1\r\n127898,1\r\n127899,1\r\n127900,1\r\n127901,1\r\n127902,1\r\n127903,1\r\n127904,1\r\n127905,1\r\n127906,1\r\n127907,1\r\n127908,1\r\n127909,1\r\n127910,1\r\n127911,1\r\n127912,1\r\n127913,1\r\n127914,1\r\n127915,1\r\n127916,1\r\n127917,1\r\n127918,1\r\n127919,1\r\n127920,1\r\n127921,1\r\n127922,1\r\n127923,1\r\n127924,1\r\n127925,1\r\n127926,1\r\n127927,1\r\n127928,1\r\n127929,1\r\n127930,1\r\n127931,1\r\n127932,1\r\n127933,1\r\n127934,1\r\n127935,1\r\n127936,1\r\n127937,1\r\n127938,1\r\n127939,1\r\n127940,1\r\n127941,1\r\n127942,1\r\n127943,1\r\n127944,1\r\n127945,1\r\n127946,1\r\n127947,1\r\n127948,1\r\n127949,1\r\n127950,1\r\n127951,1\r\n127952,1\r\n127953,1\r\n127954,1\r\n127955,1\r\n127956,1\r\n127957,1\r\n127958,1\r\n127959,1\r\n127960,1\r\n127961,1\r\n127962,1\r\n127963,1\r\n127964,1\r\n127965,1\r\n127966,1\r\n127967,1\r\n127968,1\r\n127969,1\r\n127970,1\r\n127971,1\r\n127972,1\r\n127973,1\r\n127974,1\r\n127975,1\r\n127976,1\r\n127977,1\r\n127978,1\r\n127979,1\r\n127980,1\r\n127981,1\r\n127982,1\r\n127983,1\r\n127984,1\r\n127985,1\r\n127986,1\r\n127987,1\r\n127988,1\r\n127989,1\r\n127990,1\r\n127991,1\r\n127992,1\r\n127993,1\r\n127994,1\r\n128000,1\r\n128001,1\r\n128002,1\r\n128003,1\r\n128004,1\r\n128005,1\r\n128006,1\r\n128007,1\r\n128008,1\r\n128009,1\r\n128010,1\r\n128011,1\r\n128012,1\r\n128013,1\r\n128014,1\r\n128015,1\r\n128016,1\r\n128017,1\r\n128018,1\r\n128019,1\r\n128020,1\r\n128021,1\r\n128022,1\r\n128023,1\r\n128024,1\r\n128025,1\r\n128026,1\r\n128027,1\r\n128028,1\r\n128029,1\r\n128030,1\r\n128031,1\r\n128032,1\r\n128033,1\r\n128034,1\r\n128035,1\r\n128036,1\r\n128037,1\r\n128038,1\r\n128039,1\r\n128040,1\r\n128041,1\r\n128042,1\r\n128043,1\r\n128044,1\r\n128045,1\r\n128046,1\r\n128047,1\r\n128048,1\r\n128049,1\r\n128050,1\r\n128051,1\r\n128052,1\r\n128053,1\r\n128054,1\r\n128055,1\r\n128056,1\r\n128057,1\r\n128058,1\r\n128059,1\r\n128060,1\r\n128061,1\r\n128062,1\r\n128063,1\r\n128064,1\r\n128065,1\r\n128066,1\r\n128067,1\r\n128068,1\r\n128069,1\r\n128070,1\r\n128071,1\r\n128072,1\r\n128073,1\r\n128074,1\r\n128075,1\r\n128076,1\r\n128077,1\r\n128078,1\r\n128079,1\r\n128080,1\r\n128081,1\r\n128082,1\r\n128083,1\r\n128084,1\r\n128085,1\r\n128086,1\r\n128087,1\r\n128088,1\r\n128089,1\r\n128090,1\r\n128091,1\r\n128092,1\r\n128093,1\r\n128094,1\r\n128095,1\r\n128096,1\r\n128097,1\r\n128098,1\r\n128099,1\r\n128100,1\r\n128101,1\r\n128102,1\r\n128103,1\r\n128104,1\r\n128105,1\r\n128106,1\r\n128107,1\r\n128108,1\r\n128109,1\r\n128110,1\r\n128111,1\r\n128112,1\r\n128113,1\r\n128114,1\r\n128115,1\r\n128116,1\r\n128117,1\r\n128118,1\r\n128119,1\r\n128120,1\r\n128121,1\r\n128122,1\r\n128123,1\r\n128124,1\r\n128125,1\r\n128126,1\r\n128127,1\r\n128128,1\r\n128129,1\r\n128130,1\r\n128131,1\r\n128132,1\r\n128133,1\r\n128134,1\r\n128135,1\r\n128136,1\r\n128137,1\r\n128138,1\r\n128139,1\r\n128140,1\r\n128141,1\r\n128142,1\r\n128143,1\r\n128144,1\r\n128145,1\r\n128146,1\r\n128147,1\r\n128148,1\r\n128149,1\r\n128150,1\r\n128151,1\r\n128152,1\r\n128153,1\r\n128154,1\r\n128155,1\r\n128156,1\r\n128157,1\r\n128158,1\r\n128159,1\r\n128160,1\r\n128161,1\r\n128162,1\r\n128163,1\r\n128164,1\r\n128165,1\r\n128166,1\r\n128167,1\r\n128168,1\r\n128169,1\r\n128170,1\r\n128171,1\r\n128172,1\r\n128173,1\r\n128174,1\r\n128175,1\r\n128176,1\r\n128177,1\r\n128178,1\r\n128179,1\r\n128180,1\r\n128181,1\r\n128182,1\r\n128183,1\r\n128184,1\r\n128185,1\r\n128186,1\r\n128187,1\r\n128188,1\r\n128189,1\r\n128190,1\r\n128191,1\r\n128192,1\r\n128193,1\r\n128194,1\r\n128195,1\r\n128196,1\r\n128197,1\r\n128198,1\r\n128199,1\r\n128200,1\r\n128201,1\r\n128202,1\r\n128203,1\r\n128204,1\r\n128205,1\r\n128206,1\r\n128207,1\r\n128208,1\r\n128209,1\r\n128210,1\r\n128211,1\r\n128212,1\r\n128213,1\r\n128214,1\r\n128215,1\r\n128216,1\r\n128217,1\r\n128218,1\r\n128219,1\r\n128220,1\r\n128221,1\r\n128222,1\r\n128223,1\r\n128224,1\r\n128225,1\r\n128226,1\r\n128227,1\r\n128228,1\r\n128229,1\r\n128230,1\r\n128231,1\r\n128232,1\r\n128233,1\r\n128234,1\r\n128235,1\r\n128236,1\r\n128237,1\r\n128238,1\r\n128239,1\r\n128240,1\r\n128241,1\r\n128242,1\r\n128243,1\r\n128244,1\r\n128245,1\r\n128246,1\r\n128247,1\r\n128248,1\r\n128249,1\r\n128250,1\r\n128251,1\r\n128252,1\r\n128253,1\r\n128254,1\r\n128255,1\r\n128256,1\r\n128257,1\r\n128258,1\r\n128259,1\r\n128260,1\r\n128261,1\r\n128262,1\r\n128263,1\r\n128264,1\r\n128265,1\r\n128266,1\r\n128267,1\r\n128268,1\r\n128269,1\r\n128270,1\r\n128271,1\r\n128272,1\r\n128273,1\r\n128274,1\r\n128275,1\r\n128276,1\r\n128277,1\r\n128278,1\r\n128279,1\r\n128280,1\r\n128281,1\r\n128282,1\r\n128283,1\r\n128284,1\r\n128285,1\r\n128286,1\r\n128287,1\r\n128288,1\r\n128289,1\r\n128290,1\r\n128291,1\r\n128292,1\r\n128293,1\r\n128294,1\r\n128295,1\r\n128296,1\r\n128297,1\r\n128298,1\r\n128299,1\r\n128300,1\r\n128301,1\r\n128302,1\r\n128303,1\r\n128304,1\r\n128305,1\r\n128306,1\r\n128307,1\r\n128308,1\r\n128309,1\r\n128310,1\r\n128311,1\r\n128312,1\r\n128313,1\r\n128314,1\r\n128315,1\r\n128316,1\r\n128317,1\r\n128326,1\r\n128327,1\r\n128328,1\r\n128329,1\r\n128330,1\r\n128331,1\r\n128332,1\r\n128333,1\r\n128334,1\r\n128335,1\r\n128336,1\r\n128337,1\r\n128338,1\r\n128339,1\r\n128340,1\r\n128341,1\r\n128342,1\r\n128343,1\r\n128344,1\r\n128345,1\r\n128346,1\r\n128347,1\r\n128348,1\r\n128349,1\r\n128350,1\r\n128351,1\r\n128352,1\r\n128353,1\r\n128354,1\r\n128355,1\r\n128356,1\r\n128357,1\r\n128358,1\r\n128359,1\r\n128360,1\r\n128361,1\r\n128362,1\r\n128363,1\r\n128364,1\r\n128365,1\r\n128366,1\r\n128367,1\r\n128368,1\r\n128369,1\r\n128370,1\r\n128371,1\r\n128372,1\r\n128373,1\r\n128374,1\r\n128375,1\r\n128376,1\r\n128377,1\r\n128378,1\r\n128379,1\r\n128380,1\r\n128381,1\r\n128382,1\r\n128383,1\r\n128384,1\r\n128385,1\r\n128386,1\r\n128387,1\r\n128388,1\r\n128389,1\r\n128390,1\r\n128391,1\r\n128392,1\r\n128393,1\r\n128394,1\r\n128395,1\r\n128396,1\r\n128397,1\r\n128398,1\r\n128399,1\r\n128400,1\r\n128401,1\r\n128402,1\r\n128403,1\r\n128404,1\r\n128405,1\r\n128406,1\r\n128407,1\r\n128408,1\r\n128409,1\r\n128410,1\r\n128411,1\r\n128412,1\r\n128413,1\r\n128414,1\r\n128415,1\r\n128416,1\r\n128417,1\r\n128418,1\r\n128419,1\r\n128420,1\r\n128421,1\r\n128422,1\r\n128423,1\r\n128424,1\r\n128425,1\r\n128426,1\r\n128427,1\r\n128428,1\r\n128429,1\r\n128430,1\r\n128431,1\r\n128432,1\r\n128433,1\r\n128434,1\r\n128435,1\r\n128436,1\r\n128437,1\r\n128438,1\r\n128439,1\r\n128440,1\r\n128441,1\r\n128442,1\r\n128443,1\r\n128444,1\r\n128445,1\r\n128446,1\r\n128447,1\r\n128448,1\r\n128449,1\r\n128450,1\r\n128451,1\r\n128452,1\r\n128453,1\r\n128454,1\r\n128455,1\r\n128456,1\r\n128457,1\r\n128458,1\r\n128459,1\r\n128460,1\r\n128461,1\r\n128462,1\r\n128463,1\r\n128464,1\r\n128465,1\r\n128466,1\r\n128467,1\r\n128468,1\r\n128469,1\r\n128470,1\r\n128471,1\r\n128472,1\r\n128473,1\r\n128474,1\r\n128475,1\r\n128476,1\r\n128477,1\r\n128478,1\r\n128479,1\r\n128480,1\r\n128481,1\r\n128482,1\r\n128483,1\r\n128484,1\r\n128485,1\r\n128486,1\r\n128487,1\r\n128488,1\r\n128489,1\r\n128490,1\r\n128491,1\r\n128492,1\r\n128493,1\r\n128494,1\r\n128495,1\r\n128496,1\r\n128497,1\r\n128498,1\r\n128499,1\r\n128500,1\r\n128501,1\r\n128502,1\r\n128503,1\r\n128504,1\r\n128505,1\r\n128506,1\r\n128507,1\r\n128508,1\r\n128509,1\r\n128510,1\r\n128511,1\r\n128512,1\r\n128513,1\r\n128514,1\r\n128515,1\r\n128516,1\r\n128517,1\r\n128518,1\r\n128519,1\r\n128520,1\r\n128521,1\r\n128522,1\r\n128523,1\r\n128524,1\r\n128525,1\r\n128526,1\r\n128527,1\r\n128528,1\r\n128529,1\r\n128530,1\r\n128531,1\r\n128532,1\r\n128533,1\r\n128534,1\r\n128535,1\r\n128536,1\r\n128537,1\r\n128538,1\r\n128539,1\r\n128540,1\r\n128541,1\r\n128542,1\r\n128543,1\r\n128544,1\r\n128545,1\r\n128546,1\r\n128547,1\r\n128548,1\r\n128549,1\r\n128550,1\r\n128551,1\r\n128552,1\r\n128553,1\r\n128554,1\r\n128555,1\r\n128556,1\r\n128557,1\r\n128558,1\r\n128559,1\r\n128560,1\r\n128561,1\r\n128562,1\r\n128563,1\r\n128564,1\r\n128565,1\r\n128566,1\r\n128567,1\r\n128568,1\r\n128569,1\r\n128570,1\r\n128571,1\r\n128572,1\r\n128573,1\r\n128574,1\r\n128575,1\r\n128576,1\r\n128577,1\r\n128578,1\r\n128579,1\r\n128580,1\r\n128581,1\r\n128582,1\r\n128583,1\r\n128584,1\r\n128585,1\r\n128586,1\r\n128587,1\r\n128588,1\r\n128589,1\r\n128590,1\r\n128591,1\r\n128592,1\r\n128593,1\r\n128594,1\r\n128595,1\r\n128596,1\r\n128597,1\r\n128598,1\r\n128599,1\r\n128600,1\r\n128601,1\r\n128602,1\r\n128603,1\r\n128604,1\r\n128605,1\r\n128606,1\r\n128607,1\r\n128608,1\r\n128609,1\r\n128610,1\r\n128611,1\r\n128612,1\r\n128613,1\r\n128614,1\r\n128615,1\r\n128616,1\r\n128617,1\r\n128618,1\r\n128619,1\r\n128620,1\r\n128621,1\r\n128622,1\r\n128623,1\r\n128624,1\r\n128625,1\r\n128626,1\r\n128627,1\r\n128628,1\r\n128629,1\r\n128630,0\r\n128631,0\r\n128632,0\r\n128633,1\r\n128634,1\r\n128635,1\r\n128636,1\r\n128637,1\r\n128638,1\r\n128639,1\r\n128640,1\r\n128641,1\r\n128642,1\r\n128643,1\r\n128644,1\r\n128645,1\r\n128646,1\r\n128647,1\r\n128648,1\r\n128649,1\r\n128650,1\r\n128651,1\r\n128652,1\r\n128653,1\r\n128654,1\r\n128655,0\r\n128656,1\r\n128657,1\r\n128658,1\r\n128659,1\r\n128660,1\r\n128661,1\r\n128662,1\r\n128663,1\r\n128664,1\r\n128665,1\r\n128666,1\r\n128667,1\r\n128668,1\r\n128669,1\r\n128670,1\r\n128671,1\r\n128672,1\r\n128673,1\r\n128674,1\r\n128675,1\r\n128676,1\r\n128677,1\r\n128678,0\r\n128679,1\r\n128680,1\r\n128681,1\r\n128682,1\r\n128683,1\r\n128684,1\r\n128685,1\r\n128686,1\r\n128687,1\r\n128688,1\r\n128689,1\r\n128690,1\r\n128691,1\r\n128692,1\r\n128693,1\r\n128694,1\r\n128695,1\r\n128696,1\r\n128697,1\r\n128698,1\r\n128699,1\r\n128700,1\r\n128701,1\r\n128702,1\r\n128703,1\r\n128704,1\r\n128705,1\r\n128706,1\r\n128707,1\r\n128708,1\r\n128709,1\r\n128710,1\r\n128711,1\r\n128712,1\r\n128713,1\r\n128714,1\r\n128715,1\r\n128716,1\r\n128717,1\r\n128718,1\r\n128719,1\r\n128720,1\r\n128721,1\r\n128722,1\r\n128723,1\r\n128724,1\r\n128725,1\r\n128726,1\r\n128727,1\r\n128732,1\r\n128733,1\r\n128734,1\r\n128735,1\r\n128736,1\r\n128737,1\r\n128738,1\r\n128739,1\r\n128740,1\r\n128741,1\r\n128742,1\r\n128743,1\r\n128744,1\r\n128745,1\r\n128746,1\r\n128747,1\r\n128748,1\r\n128752,1\r\n128753,1\r\n128754,1\r\n128755,1\r\n128756,1\r\n128757,1\r\n128758,1\r\n128759,1\r\n128760,1\r\n128761,1\r\n128762,1\r\n128763,1\r\n128764,1\r\n128884,1\r\n128885,1\r\n128886,1\r\n128891,1\r\n128892,1\r\n128893,1\r\n128894,1\r\n128895,1\r\n128981,1\r\n128982,1\r\n128983,1\r\n128984,1\r\n128985,1\r\n128992,1\r\n128993,1\r\n128994,1\r\n128995,1\r\n128996,1\r\n128997,1\r\n128998,1\r\n128999,1\r\n129000,1\r\n129001,1\r\n129002,1\r\n129003,1\r\n129008,0\r\n129200,0\r\n129201,0\r\n129202,0\r\n129203,0\r\n129204,0\r\n129205,0\r\n129206,0\r\n129207,0\r\n129208,0\r\n129209,0\r\n129210,0\r\n129211,0\r\n129216,0\r\n129217,0\r\n129292,1\r\n129293,1\r\n129294,1\r\n129295,1\r\n129296,1\r\n129297,1\r\n129298,1\r\n129299,1\r\n129300,1\r\n129301,1\r\n129302,1\r\n129303,1\r\n129304,1\r\n129305,1\r\n129306,1\r\n129307,1\r\n129308,1\r\n129309,1\r\n129310,1\r\n129311,1\r\n129312,1\r\n129313,1\r\n129314,1\r\n129315,1\r\n129316,1\r\n129317,1\r\n129318,1\r\n129319,1\r\n129320,1\r\n129321,1\r\n129322,1\r\n129323,1\r\n129324,1\r\n129325,1\r\n129326,1\r\n129327,1\r\n129328,1\r\n129329,1\r\n129330,1\r\n129331,1\r\n129332,1\r\n129333,1\r\n129334,1\r\n129335,1\r\n129336,1\r\n129337,1\r\n129338,1\r\n129340,1\r\n129341,1\r\n129342,1\r\n129343,1\r\n129344,1\r\n129345,1\r\n129346,1\r\n129347,1\r\n129348,1\r\n129349,1\r\n129351,1\r\n129352,1\r\n129353,1\r\n129354,1\r\n129355,1\r\n129356,1\r\n129357,1\r\n129358,1\r\n129359,1\r\n129360,1\r\n129361,1\r\n129362,1\r\n129363,1\r\n129364,1\r\n129365,1\r\n129366,1\r\n129367,1\r\n129368,1\r\n129369,1\r\n129370,1\r\n129371,1\r\n129372,1\r\n129373,1\r\n129374,1\r\n129375,1\r\n129376,1\r\n129377,1\r\n129378,1\r\n129379,1\r\n129380,1\r\n129381,1\r\n129382,1\r\n129383,1\r\n129384,1\r\n129385,1\r\n129386,1\r\n129387,1\r\n129388,1\r\n129389,1\r\n129390,1\r\n129391,1\r\n129392,1\r\n129393,1\r\n129394,1\r\n129395,1\r\n129396,1\r\n129397,1\r\n129398,1\r\n129399,1\r\n129400,1\r\n129401,1\r\n129402,1\r\n129403,1\r\n129404,1\r\n129405,1\r\n129406,1\r\n129407,1\r\n129408,1\r\n129409,1\r\n129410,1\r\n129411,1\r\n129412,1\r\n129413,1\r\n129414,1\r\n129415,1\r\n129416,1\r\n129417,1\r\n129418,1\r\n129419,1\r\n129420,1\r\n129421,1\r\n129422,1\r\n129423,1\r\n129424,1\r\n129425,1\r\n129426,1\r\n129427,1\r\n129428,1\r\n129429,1\r\n129430,1\r\n129431,1\r\n129432,1\r\n129433,1\r\n129434,1\r\n129435,1\r\n129436,1\r\n129437,1\r\n129438,1\r\n129439,1\r\n129440,1\r\n129441,1\r\n129442,1\r\n129443,1\r\n129444,1\r\n129445,1\r\n129446,1\r\n129447,1\r\n129448,1\r\n129449,1\r\n129450,1\r\n129451,1\r\n129452,1\r\n129453,1\r\n129454,1\r\n129455,1\r\n129456,1\r\n129457,1\r\n129458,1\r\n129459,1\r\n129460,1\r\n129461,1\r\n129462,1\r\n129463,1\r\n129464,1\r\n129465,1\r\n129466,1\r\n129467,1\r\n129468,1\r\n129469,1\r\n129470,1\r\n129471,1\r\n129472,1\r\n129473,1\r\n129474,1\r\n129475,1\r\n129476,1\r\n129477,1\r\n129478,1\r\n129479,1\r\n129480,1\r\n129481,1\r\n129482,1\r\n129483,1\r\n129484,1\r\n129485,1\r\n129486,1\r\n129487,1\r\n129488,1\r\n129489,1\r\n129490,1\r\n129491,1\r\n129492,1\r\n129493,1\r\n129494,1\r\n129495,1\r\n129496,1\r\n129497,1\r\n129498,1\r\n129499,1\r\n129500,1\r\n129501,1\r\n129502,1\r\n129503,1\r\n129504,1\r\n129505,1\r\n129506,1\r\n129507,1\r\n129508,1\r\n129509,1\r\n129510,1\r\n129511,1\r\n129512,1\r\n129513,1\r\n129514,0\r\n129515,1\r\n129516,1\r\n129517,1\r\n129518,1\r\n129519,1\r\n129520,1\r\n129521,1\r\n129522,1\r\n129523,1\r\n129524,1\r\n129525,1\r\n129526,1\r\n129527,1\r\n129528,1\r\n129529,1\r\n129530,1\r\n129531,1\r\n129532,1\r\n129533,1\r\n129534,1\r\n129535,1\r\n129536,1\r\n129537,1\r\n129538,1\r\n129539,1\r\n129540,1\r\n129541,1\r\n129542,1\r\n129543,1\r\n129544,1\r\n129545,1\r\n129546,1\r\n129547,1\r\n129548,1\r\n129549,1\r\n129550,1\r\n129551,1\r\n129552,1\r\n129553,1\r\n129554,1\r\n129555,1\r\n129556,1\r\n129557,1\r\n129558,1\r\n129559,1\r\n129560,1\r\n129561,1\r\n129562,1\r\n129563,1\r\n129564,1\r\n129565,1\r\n129566,1\r\n129567,1\r\n129568,1\r\n129569,1\r\n129570,1\r\n129571,1\r\n129572,1\r\n129573,1\r\n129574,1\r\n129575,1\r\n129576,1\r\n129577,1\r\n129578,1\r\n129579,1\r\n129580,1\r\n129581,1\r\n129582,1\r\n129583,1\r\n129584,1\r\n129585,1\r\n129586,1\r\n129587,1\r\n129588,1\r\n129589,1\r\n129590,1\r\n129591,1\r\n129592,1\r\n129593,1\r\n129594,1\r\n129595,1\r\n129596,1\r\n129597,1\r\n129598,1\r\n129599,1\r\n129600,1\r\n129601,1\r\n129602,1\r\n129603,1\r\n129604,1\r\n129605,1\r\n129606,1\r\n129607,1\r\n129608,1\r\n129609,1\r\n129610,1\r\n129611,1\r\n129612,1\r\n129613,1\r\n129614,1\r\n129615,1\r\n129616,1\r\n129617,1\r\n129618,1\r\n129619,1\r\n129632,1\r\n129633,1\r\n129634,1\r\n129635,1\r\n129636,1\r\n129637,1\r\n129638,1\r\n129639,1\r\n129640,1\r\n129641,1\r\n129642,1\r\n129643,1\r\n129644,1\r\n129645,1\r\n129648,1\r\n129649,1\r\n129650,1\r\n129651,1\r\n129652,1\r\n129653,1\r\n129654,1\r\n129655,1\r\n129656,1\r\n129657,1\r\n129658,1\r\n129659,1\r\n129660,1\r\n129664,1\r\n129665,1\r\n129666,1\r\n129667,1\r\n129668,1\r\n129669,1\r\n129670,1\r\n129671,1\r\n129672,1\r\n129673,1\r\n129679,1\r\n129680,1\r\n129681,1\r\n129682,1\r\n129683,1\r\n129684,1\r\n129685,1\r\n129686,1\r\n129687,1\r\n129688,1\r\n129689,1\r\n129690,1\r\n129691,1\r\n129692,1\r\n129693,1\r\n129694,1\r\n129695,1\r\n129696,1\r\n129697,1\r\n129698,1\r\n129699,1\r\n129700,1\r\n129701,1\r\n129702,1\r\n129703,1\r\n129704,1\r\n129705,1\r\n129706,1\r\n129707,1\r\n129708,1\r\n129709,1\r\n129710,1\r\n129711,1\r\n129712,1\r\n129713,1\r\n129714,1\r\n129715,1\r\n129716,1\r\n129717,1\r\n129718,1\r\n129719,1\r\n129720,1\r\n129721,1\r\n129722,1\r\n129723,1\r\n129724,1\r\n129725,1\r\n129726,1\r\n129727,1\r\n129728,1\r\n129729,1\r\n129730,1\r\n129731,1\r\n129732,1\r\n129733,1\r\n129734,1\r\n129742,1\r\n129743,1\r\n129744,1\r\n129745,1\r\n129746,1\r\n129747,1\r\n129748,1\r\n129749,1\r\n129750,1\r\n129751,1\r\n129752,1\r\n129753,1\r\n129754,1\r\n129755,1\r\n129756,1\r\n129759,1\r\n129760,1\r\n129761,1\r\n129762,1\r\n129763,1\r\n129764,1\r\n129765,1\r\n129766,1\r\n129767,1\r\n129768,1\r\n129769,1\r\n129776,1\r\n129777,1\r\n129778,1\r\n129779,1\r\n129780,1\r\n129781,1\r\n129782,1\r\n129783,1\r\n129784,1\r\n";

/***/ },

/***/ "./shaders/line.frag"
/*!***************************!*\
  !*** ./shaders/line.frag ***!
  \***************************/
(module) {

"use strict";
module.exports = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec4 fColor;\r\nin float fOffset;\r\n\r\nuniform vec3 uLinePattern;\r\n\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  outColor = fColor;\r\n  float offset = fOffset + uLinePattern[0] + 0.001;\r\n  offset = mod(offset, uLinePattern[1]);\r\n  if (offset < uLinePattern[2] && fColor.a == 1.0) {\r\n    outColor.rgb = vec3(0);\r\n  }\r\n}";

/***/ },

/***/ "./shaders/line.vert"
/*!***************************!*\
  !*** ./shaders/line.vert ***!
  \***************************/
(module) {

"use strict";
module.exports = "#version 300 es\r\nin vec2 vPosition;\r\nin vec4 vColor;\r\nin float vOffset;\r\n\r\nuniform highp vec4 uView;\r\n\r\nout vec4 fColor;\r\nout float fOffset;\r\n\r\nconst int atlasWidth = 64;\r\n\r\nvoid main() {\r\n  vec2 pos = (vPosition + uView.xy) / uView.zw * 2.0 - 1.0;\r\n  pos.y *= -1.0;\r\n  gl_Position = vec4(pos, 0.0, 1.0);\r\n  fColor = vColor;\r\n  fOffset = vOffset;\r\n}";

/***/ },

/***/ "./shaders/sprite.frag"
/*!*****************************!*\
  !*** ./shaders/sprite.frag ***!
  \*****************************/
(module) {

"use strict";
module.exports = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 fTexCoord;\r\nin vec4 fBackColor;\r\nin vec4 fFrontColor;\r\n\r\nout vec4 outColor;\r\n\r\nuniform mediump sampler2D uSampler;\r\n\r\nvoid main() {\r\n  float value = texture(uSampler, fTexCoord).a;\r\n  outColor = (value > 0.5) ? fFrontColor : fBackColor;\r\n  if (outColor.a < 0.5) {\r\n    discard;\r\n  }\r\n}";

/***/ },

/***/ "./shaders/sprite.vert"
/*!*****************************!*\
  !*** ./shaders/sprite.vert ***!
  \*****************************/
(module) {

"use strict";
module.exports = "#version 300 es\r\nin vec2 vPosition;\r\nin vec2 vTexCoord;\r\nin vec4 iBackColor;\r\nin vec4 iFrontColor;\r\nin vec2 iOffset;\r\nin float iTexIndex;\r\nin float iHalfWidth;\r\n\r\nuniform highp vec4 uView;\r\n\r\nout vec2 fTexCoord;\r\nout vec4 fBackColor;\r\nout vec4 fFrontColor;\r\n\r\nconst int atlasWidth = 64;\r\n\r\nvoid main() {\r\n  vec2 pos = vPosition;\r\n  vec2 tex = vTexCoord;\r\n  if (iHalfWidth > 0.0) {\r\n    pos.x = pos.x * 0.5;\r\n    tex.x = tex.x * 0.5 + 0.25;\r\n  } \r\n  pos = (pos + iOffset + uView.xy) / uView.zw * 2.0 - 1.0;\r\n  pos.y *= -1.0;\r\n  gl_Position = vec4(pos, 0.0, 1.0);\r\n  int texX = int(iTexIndex) % atlasWidth;\r\n  int texY = int(iTexIndex) / atlasWidth;\r\n  fTexCoord = (tex + vec2(float(texX), float(texY))) / float(atlasWidth);\r\n  fBackColor = iBackColor;\r\n  fFrontColor = iFrontColor;\r\n}";

/***/ },

/***/ "?6690"
/*!*********************!*\
  !*** url (ignored) ***!
  \*********************/
() {

/* (ignored) */

/***/ }

}]);
//# sourceMappingURL=player_ts.bundle.js.map