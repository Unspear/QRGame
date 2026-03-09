(self["webpackChunk"] = self["webpackChunk"] || []).push([["player_ts"],{

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
    #currentPos;
    #targetPos;
    constructor() {
        this.#currentPos = { x: 0, y: 0 };
        this.#targetPos = { x: 0, y: 0 };
    }
    set x(value) {
        this.#targetPos.x = value;
    }
    set y(value) {
        this.#targetPos.y = value;
    }
    get x() {
        return this.#targetPos.x;
    }
    get y() {
        return this.#targetPos.y;
    }
    frame(deltaTime) {
        this.#currentPos.x = this.#targetPos.x;
        this.#currentPos.y = this.#targetPos.y;
    }
    getTargetPos() {
        return Object.assign({}, this.#targetPos);
    }
    getViewOffset() {
        let offsetX = -this.#currentPos.x;
        let offsetY = -this.#currentPos.y;
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
/* harmony import */ var _spriteDragConstraint__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spriteDragConstraint */ "./spriteDragConstraint.ts");
/* harmony import */ var _sprite__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprite */ "./sprite.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants */ "./constants.ts");
/* harmony import */ var _tile__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tile */ "./tile.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util */ "./util.ts");
/* harmony import */ var sam_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! sam-js */ "../node_modules/sam-js/dist/samjs.esm.min.js");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./camera */ "./camera.ts");
/* harmony import */ var wasmoon_dist_glue_wasm__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! wasmoon/dist/glue.wasm */ "../node_modules/wasmoon/dist/glue.wasm");
/* harmony import */ var _press_play_png__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./press-play.png */ "./press-play.png");











let pressPlayImage = new Image();
pressPlayImage.src = _press_play_png__WEBPACK_IMPORTED_MODULE_10__;
class Engine {
    gameCanvas;
    textToSpeech;
    luaFactory;
    ctx;
    downPointers;
    luaDrag;
    luaTap;
    game;
    sprites;
    tileMap;
    camera;
    matterEngine;
    spriteDragConstraint;
    lua;
    luaFrame;
    paused;
    currentSpeak;
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.textToSpeech = new sam_js__WEBPACK_IMPORTED_MODULE_7__["default"]();
        this.luaFactory = new wasmoon__WEBPACK_IMPORTED_MODULE_0__.LuaFactory(wasmoon_dist_glue_wasm__WEBPACK_IMPORTED_MODULE_9__);
        this.ctx = gameCanvas.getContext('2d');
        // Fill Background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        pressPlayImage.decode().then(() => {
            this.ctx.fillStyle = "white";
            this.ctx.drawImage(pressPlayImage, 0, 0);
        });
        this.downPointers = new Set();
        gameCanvas.addEventListener('pointerdown', (event) => {
            this.downPointers.add(event.pointerId);
            if (this.luaDrag) {
                this.luaDrag(_util__WEBPACK_IMPORTED_MODULE_6__.getPointerPos(this.gameCanvas, event));
            }
            if (this.luaTap) {
                this.luaTap();
            }
        });
        gameCanvas.addEventListener('pointermove', (event) => {
            if (this.downPointers.has(event.pointerId)) {
                if (this.luaDrag) {
                    this.luaDrag(_util__WEBPACK_IMPORTED_MODULE_6__.getPointerPos(this.gameCanvas, event));
                }
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.downPointers.delete(event.pointerId);
        });
        gameCanvas.addEventListener('drag', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragstart', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragend', (event) => event.preventDefault(), { passive: false });
        this.paused = true;
    }
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        const gameTileMap = _tile__WEBPACK_IMPORTED_MODULE_5__.TileMap.Copy(game.tileMap);
        const gamePatchMap = _tile__WEBPACK_IMPORTED_MODULE_5__.PatchMap.Copy(game.patchMap);
        this.tileMap = gamePatchMap.createTileMap(gameTileMap);
        this.camera = new _camera__WEBPACK_IMPORTED_MODULE_8__.Camera();
        if (this.currentSpeak) {
            this.currentSpeak.abort("Interrupted");
        }
        // Create physics engine
        matter_js__WEBPACK_IMPORTED_MODULE_1__.Resolver._restingThresh = 1;
        this.matterEngine = matter_js__WEBPACK_IMPORTED_MODULE_1__.Engine.create({
            gravity: { scale: 0 }
        });
        this.tileMap.createBodies(this.matterEngine, game.solidTiles);
        this.spriteDragConstraint = new _spriteDragConstraint__WEBPACK_IMPORTED_MODULE_2__.SpriteDragConstraint(this.matterEngine, this.gameCanvas);
        matter_js__WEBPACK_IMPORTED_MODULE_1__.Composite.add(this.matterEngine.world, this.spriteDragConstraint.constraint);
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
        this.lua.global.set('say', (string) => {
            // Replace non-ascii and control characters with space
            const ascii = string.replace(/[^\x20-\x7E]/g, " ");
            if (this.currentSpeak) {
                this.currentSpeak.abort("Interrupted");
            }
            this.currentSpeak = this.textToSpeech.speak(ascii);
        });
        this.lua.global.set('camera', this.camera);
        // Load Script
        this.lua.doStringSync(this.game.script);
        // Get Lua References
        this.luaFrame = this.lua.global.get('frame');
        this.luaTap = this.lua.global.get('tap');
        this.luaDrag = this.lua.global.get('drag');
        // Start
        requestAnimationFrame(this.#mainLoop.bind(this));
    }
    setPaused(value) {
        this.paused = value;
    }
    isPaused() {
        return this.paused;
    }
    #mainLoop(timestamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > _constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS) {
            if (this.gameCanvas.checkVisibility() && !this.paused) {
                // Frame
                if (this.luaFrame) {
                    this.luaFrame();
                }
                this.camera.frame(_constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME);
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
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
                // Draw Tilemap
                let viewOffset = this.camera.getViewOffset();
                this.tileMap.draw(this.ctx, viewOffset);
                // Draw Sprites
                for (let sprite of this.sprites) {
                    sprite.draw(this.ctx, viewOffset);
                }
            }
            if (elapsed > _constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS * 5) {
                console.log("Elapsed time is large, skipping frames");
                this.#previousTimestamp = timestamp;
            }
            else {
                this.#previousTimestamp += _constants__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS;
            }
        }
        requestAnimationFrame((t) => this.#mainLoop(t));
    }
    #previousTimestamp;
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
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./game.ts");
/* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./engine */ "./engine.ts");
/* harmony import */ var _pack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pack */ "./pack.ts");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pack__WEBPACK_IMPORTED_MODULE_3__]);
var __webpack_async_dependencies_result__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
_pack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_async_dependencies_result__[0];




class Player {
    canvas;
    playPauseButton;
    reloadButton;
    urlButton;
    qrButton;
    qrCanvas;
    gameProvider;
    constructor(gameProvider) {
        this.gameProvider = gameProvider;
        this.canvas = document.getElementById('game-canvas');
        this.playPauseButton = document.getElementById('play-pause-button');
        this.reloadButton = document.getElementById('reload-button');
        this.urlButton = document.getElementById('url-button');
        this.qrButton = document.getElementById('qr-button');
        this.qrCanvas = document.getElementById('qr-canvas');
        const engine = new _engine__WEBPACK_IMPORTED_MODULE_2__.Engine(this.canvas);
        const qrGenerateOptions = {
            minCorrectionLevel: lean_qr__WEBPACK_IMPORTED_MODULE_0__.correction.L
        };
        const qrImageOptions = {
            on: [0, 0, 0, 255],
            off: [255, 255, 255, 255]
        };
        (0,lean_qr__WEBPACK_IMPORTED_MODULE_0__.generate)((0,_pack__WEBPACK_IMPORTED_MODULE_3__.gameToUrl)(gameProvider()), qrGenerateOptions).toCanvas(this.qrCanvas, qrImageOptions);
        // Buttons
        let that = this;
        this.playPauseButton.onclick = async function () {
            if (engine.game === undefined) {
                engine.play(gameProvider() ?? new _game__WEBPACK_IMPORTED_MODULE_1__.Game());
            }
            engine.setPaused(!engine.isPaused());
        };
        this.reloadButton.onclick = async function () {
            engine.play(gameProvider() ?? new _game__WEBPACK_IMPORTED_MODULE_1__.Game());
            engine.setPaused(false);
            (0,lean_qr__WEBPACK_IMPORTED_MODULE_0__.generate)((0,_pack__WEBPACK_IMPORTED_MODULE_3__.gameToUrl)(engine.game), qrGenerateOptions).toCanvas(that.qrCanvas, qrImageOptions);
        };
        this.urlButton.onclick = async function () {
            navigator.clipboard.writeText((0,_pack__WEBPACK_IMPORTED_MODULE_3__.gameToUrl)(engine.game));
        };
        this.qrButton.onclick = async function () {
            that.qrCanvas.toBlob(function (blob) {
                if (blob !== null) {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]);
                }
                else {
                    throw "Blob was null, could not copy QR Image to clipboard";
                }
            });
        };
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

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
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./render */ "./render.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./constants.ts");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! matter-js */ "../node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_2__);



class Sprite {
    char;
    color;
    wrap;
    compact;
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
        this.#physWidth = _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH;
        this.#physHeight = _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH;
        this.#physIsStatic = false;
        this.#physIsSensor = false;
        this.#physIsDrag = false;
        this.#physVelX = null;
        this.#physVelY = null;
        this.#physWantsBody = false;
        this.#physWantsWidth = _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH;
        this.#physWantsHeight = _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH;
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
        return this.#x - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#px + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
    }
    #getBodyY() {
        return this.#y - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#py + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
    }
    set x(value) {
        this.#x = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_2__.Body.setPosition(this.#physBody, { x: this.#getBodyX(), y: this.#getBodyY() });
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get x() {
        return this.#x;
    }
    set y(value) {
        this.#y = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_2__.Body.setPosition(this.#physBody, { x: this.#getBodyX(), y: this.#getBodyY() });
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
        if (this.#physBody) {
            this.#physBody.plugin.drag = value;
        }
    }
    get drag() {
        return this.#physIsDrag;
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
            matter_js__WEBPACK_IMPORTED_MODULE_2__.Composite.remove(matterEngine.world, this.#physBody);
            this.#physBody = null;
        }
        // Check if the body needs to be created
        if (this.#physWantsBody && this.#physBody === null) {
            // Create Body
            const options = {
                inertia: Infinity, // Prevent rotation
                restitution: 1.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: this.#physIsSensor,
                isStatic: this.#physIsStatic,
                plugin: { drag: this.#physIsDrag }
            };
            this.#physBody = matter_js__WEBPACK_IMPORTED_MODULE_2__.Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), this.#physWantsWidth, this.#physWantsHeight, options);
            this.#physWidth = this.#physWantsWidth;
            this.#physHeight = this.#physWantsHeight;
            matter_js__WEBPACK_IMPORTED_MODULE_2__.Composite.add(matterEngine.world, this.#physBody);
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
                matter_js__WEBPACK_IMPORTED_MODULE_2__.Body.setVelocity(this.#physBody, newVel);
            }
        }
        this.#physVelX = null;
        this.#physVelY = null;
    }
    postPhysicsUpdate(matterEngine) {
        if (this.#physBody) {
            this.#x = this.#physBody.position.x + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#px - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
            this.#y = this.#physBody.position.y + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#py - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
        }
    }
    draw(context, viewOffset) {
        const codePoints = [...this.char].map(c => c.codePointAt(0) ?? 0);
        _render__WEBPACK_IMPORTED_MODULE_0__["default"].draw(context, codePoints, new Array(codePoints.length).fill(this.color), this.#x + viewOffset.x, this.#y + viewOffset.y, this.#px, this.#py, this.wrap, this.compact);
    }
}


/***/ },

/***/ "./spriteDragConstraint.ts"
/*!*********************************!*\
  !*** ./spriteDragConstraint.ts ***!
  \*********************************/
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
    mouse;
    element;
    constraint;
    collisionFilter;
    constructor(engine, canvas) {
        this.type = 'spriteDragConstraint';
        this.mouse = matter_js__WEBPACK_IMPORTED_MODULE_0__.Mouse.create(canvas);
        this.element = canvas;
        this.constraint = matter_js__WEBPACK_IMPORTED_MODULE_0__.Constraint.create({
            label: 'Sprite Drag Constraint',
            pointA: this.mouse.position,
            pointB: { x: 0, y: 0 },
            length: 0.01,
            stiffness: 0.1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            }
        });
        this.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        };
        let that = this;
        matter_js__WEBPACK_IMPORTED_MODULE_0__.Events.on(engine, 'beforeUpdate', function () {
            var allBodies = matter_js__WEBPACK_IMPORTED_MODULE_0__.Composite.allBodies(engine.world);
            that.#update(allBodies);
            //that.#triggerEvents();
        });
    }
    #update(bodies) {
        if (this.mouse.button === 0) { // If button down
            if (!this.constraint.bodyB) { // If there is no body constrained
                for (let body of bodies) {
                    // Broad phase
                    if (body.plugin.drag
                        && matter_js__WEBPACK_IMPORTED_MODULE_0__.Bounds.contains(body.bounds, this.mouse.position)
                        && matter_js__WEBPACK_IMPORTED_MODULE_0__.Detector.canCollide(body.collisionFilter, this.collisionFilter)) {
                        // Narrow phase
                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                            var part = body.parts[j];
                            if (matter_js__WEBPACK_IMPORTED_MODULE_0__.Vertices.contains(part.vertices, this.mouse.position)) {
                                // Start drag
                                this.constraint.pointA = this.mouse.position;
                                this.constraint.bodyB = body;
                                this.constraint.pointB = { x: this.mouse.position.x - body.position.x, y: this.mouse.position.y - body.position.y };
                                //this.constraint.angleB = body.angle;
                                matter_js__WEBPACK_IMPORTED_MODULE_0__.Sleeping.set(body, false);
                                matter_js__WEBPACK_IMPORTED_MODULE_0__.Events.trigger(this, 'startdrag', { mouse: this.mouse, body: body });
                                break;
                            }
                        }
                    }
                }
            }
            else { // If there is a body constrained
                matter_js__WEBPACK_IMPORTED_MODULE_0__.Sleeping.set(this.constraint.bodyB, false);
                this.constraint.pointA = this.mouse.position;
            }
        }
        else if (this.constraint.bodyB) { // If button released and a body is being dragged
            matter_js__WEBPACK_IMPORTED_MODULE_0__.Events.trigger(this, 'enddrag', { mouse: this.mouse, body: this.constraint.bodyB });
            this.constraint.bodyB = null;
        }
    }
    ;
}


/***/ },

/***/ "./press-play.png"
/*!************************!*\
  !*** ./press-play.png ***!
  \************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
module.exports = __webpack_require__.p + "c2d13a665429ea85e8de.png";

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