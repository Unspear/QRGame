(self["webpackChunkqrgame"] = self["webpackChunkqrgame"] || []).push([["src_engine_js"],{

/***/ "./src/engine.js":
/*!***********************!*\
  !*** ./src/engine.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Engine: () => (/* binding */ Engine)
/* harmony export */ });
/* harmony import */ var wasmoon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasmoon */ "./node_modules/wasmoon/dist/index.js");
/* harmony import */ var wasmoon__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(wasmoon__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! matter-js */ "./node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _spriteDragConstraint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spriteDragConstraint.js */ "./src/spriteDragConstraint.js");
/* harmony import */ var _sprite_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprite.js */ "./src/sprite.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants.js */ "./src/constants.js");
/* harmony import */ var _tile_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tile.js */ "./src/tile.js");
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util.js */ "./src/util.js");
/* harmony import */ var sam_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! sam-js */ "./node_modules/sam-js/dist/samjs.esm.min.js");









class Engine {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.textToSpeech = new sam_js__WEBPACK_IMPORTED_MODULE_7__["default"]();
        this.luaFactory = new wasmoon__WEBPACK_IMPORTED_MODULE_0__.LuaFactory();
        this.ctx = gameCanvas.getContext('2d');
        this.downPointers = new Set();
        gameCanvas.addEventListener('pointerdown', (event) => {
            this.downPointers.add(event.pointerId);
            if (this.luaDrag)
            {
                this.luaDrag(_util_js__WEBPACK_IMPORTED_MODULE_6__.getPointerPos(this.gameCanvas, event));
            }
            if (this.luaTap)
            {
                this.luaTap();
            }
        });
        gameCanvas.addEventListener('pointermove', (event) => {
            if (this.downPointers.has(event.pointerId))
            {
                if (this.luaDrag)
                {
                    this.luaDrag(_util_js__WEBPACK_IMPORTED_MODULE_6__.getPointerPos(this.gameCanvas, event));
                }
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.downPointers.delete(event.pointerId);
        });
        gameCanvas.addEventListener('drag', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragstart', (event) => event.preventDefault(), { passive: false });
        gameCanvas.addEventListener('dragend', (event) => event.preventDefault(), { passive: false });
    }
    async play(game) {
        // Setup (should override any existing values)
        this.game = game;
        this.sprites = [];
        this.tileMap = _tile_js__WEBPACK_IMPORTED_MODULE_5__.TileMap.Copy(game.tileMap);
        // Create physics engine
        (matter_js__WEBPACK_IMPORTED_MODULE_1___default().Resolver)._restingThresh = 1;
        this.matterEngine = matter_js__WEBPACK_IMPORTED_MODULE_1___default().Engine.create({ 
            gravity: { scale: 0 }
        });
        this.spriteDragConstraint = _spriteDragConstraint_js__WEBPACK_IMPORTED_MODULE_2__.SpriteDragConstraint.create(this.matterEngine, this.gameCanvas);
        matter_js__WEBPACK_IMPORTED_MODULE_1___default().Composite.add(this.matterEngine.world, this.spriteDragConstraint.constraint);
        // Setup Lua Environment
        this.lua = await this.luaFactory.createEngine()
        this.lua.global.set('FRAME_TIME', _constants_js__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME);
        this.lua.global.set('createSprite', (char, color, x, y) => {
            let newSprite = new _sprite_js__WEBPACK_IMPORTED_MODULE_3__.Sprite(char, color, x, y);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('destroySprite', (sprite) => {
            this.sprites = this.sprites.filter(s => s !== sprite);
        });
        this.lua.global.set('copySprite', (sprite) => {
            let newSprite = _sprite_js__WEBPACK_IMPORTED_MODULE_3__.Sprite.Copy(sprite);
            this.sprites.push(newSprite);
            return newSprite;
        });
        this.lua.global.set('say', (string) => {
            this.textToSpeech.speak(string);
        });
        // Load Script
        this.lua.doStringSync(this.game.script);
        // Get Lua References
        this.luaFrame = this.lua.global.get('frame');
        this.luaTap = this.lua.global.get('tap');
        this.luaDrag = this.lua.global.get('drag');
        // Start
        requestAnimationFrame(this.#mainLoop.bind(this));
    }
    #mainLoop(timestamp) {
        if (this.#previousTimestamp === undefined) {
            this.#previousTimestamp = timestamp;
        }
        const elapsed = timestamp - this.#previousTimestamp;
        if (elapsed > _constants_js__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS) {
            if (this.gameCanvas.checkVisibility()) {
                // Frame
                if (this.luaFrame)
                {
                    this.luaFrame();
                }
                // Physics
                for (let sprite of this.sprites) {
                    sprite.prePhysicsUpdate(this.matterEngine)
                }
                matter_js__WEBPACK_IMPORTED_MODULE_1___default().Engine.update(this.matterEngine, _constants_js__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS);
                for (let sprite of this.sprites) {
                    sprite.postPhysicsUpdate(this.matterEngine)
                }
                // Rendering
                this.ctx.beginPath();
                // Fill Background
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
                // Draw Tilemap
                this.tileMap.draw(this.ctx);
                // Draw Sprites
                for (let sprite of this.sprites) {
                    sprite.draw(this.ctx)
                }
            }
            if (elapsed > _constants_js__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS * 5) {
                console.log("Elapsed time is large, skipping frames")
                this.#previousTimestamp = timestamp;
            } else {
                this.#previousTimestamp += _constants_js__WEBPACK_IMPORTED_MODULE_4__.FRAME_TIME_MS;
            }
        }
        requestAnimationFrame((t) => this.#mainLoop(t));
    }
    #previousTimestamp;
}

/***/ }),

/***/ "./src/sprite.js":
/*!***********************!*\
  !*** ./src/sprite.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sprite: () => (/* binding */ Sprite)
/* harmony export */ });
/* harmony import */ var _render_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./render.js */ "./src/render.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./src/constants.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! matter-js */ "./node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_2__);




class Sprite {
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
    #getEntityXFromBody() {
        return this.#physBody.position.x + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#px - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
    }
    #getEntityYFromBody() {
        return this.#physBody.position.y + _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * this.#py - _constants__WEBPACK_IMPORTED_MODULE_1__.CHAR_WIDTH * 0.5;
    }
    set x(value) {
        this.#x = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_2___default().Body.setPosition(this.#physBody, {x: this.#getBodyX(), y: this.#getBodyY()});
            //Matter.Body.setVelocity(this.#physBody, {x: 0, y: 0})
        }
    }
    get x() {
        return this.#x;
    }
    set y(value) {
        this.#y = value;
        if (this.#physBody) {
            matter_js__WEBPACK_IMPORTED_MODULE_2___default().Body.setPosition(this.#physBody, {x: this.#getBodyX(), y: this.#getBodyY()});
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
        this.#physIsStatic = value
        if (this.#physBody) {
            this.#physBody.isStatic = value;
        }
    }
    get static() {
        return this.#physIsStatic;
    }
    set sensor(value) {
        this.#physIsSensor = value
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
                return this.#physBody.velocity.x
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
                return this.#physBody.velocity.y
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
            matter_js__WEBPACK_IMPORTED_MODULE_2___default().Composite.remove(matterEngine.world, this.#physBody);
            this.#physBody = null;
        }
        // Check if the body needs to be created
        if (this.#physWantsBody && this.#physBody === null) {
            // Create Body
            const options = {
                inertia: Infinity,// Prevent rotation
                restitution: 1.0,
                frictionAir: 0.0,
                friction: 0.0,
                isSensor: this.#physIsSensor,
                isStatic: this.#physIsStatic,
                plugin: { drag: this.#physIsDrag }
            }
            this.#physBody = matter_js__WEBPACK_IMPORTED_MODULE_2___default().Bodies.rectangle(this.#getBodyX(), this.#getBodyY(), this.#physWantsWidth, this.#physWantsHeight, options);
            this.#physWidth = this.#physWantsWidth;
            this.#physHeight = this.#physWantsHeight;
            matter_js__WEBPACK_IMPORTED_MODULE_2___default().Composite.add(matterEngine.world, this.#physBody);
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
                matter_js__WEBPACK_IMPORTED_MODULE_2___default().Body.setVelocity(this.#physBody, newVel);
            }
        }
        this.#physVelX = null;
        this.#physVelY = null;
    }
    postPhysicsUpdate(matterEngine) {
        if (this.#physBody) {
            this.#x = this.#getEntityXFromBody();
            this.#y = this.#getEntityYFromBody();
        }
    }
    draw(context) {
        const codePoints = [...this.char].map(c => c.codePointAt(0));
        _render_js__WEBPACK_IMPORTED_MODULE_0__["default"].draw(context, codePoints, new Array(codePoints.length).fill(this.color), this.#x, this.#y, this.#px, this.#py, this.wrap, this.compact)
    }
}

/***/ }),

/***/ "./src/spriteDragConstraint.js":
/*!*************************************!*\
  !*** ./src/spriteDragConstraint.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpriteDragConstraint: () => (/* binding */ SpriteDragConstraint)
/* harmony export */ });
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! matter-js */ "./node_modules/matter-js/build/matter.js");
/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_0__);


var SpriteDragConstraint = {};

SpriteDragConstraint.create = function(engine, canvas) {
    var mouse = matter_js__WEBPACK_IMPORTED_MODULE_0___default().Mouse.create(canvas);
    var constraint = matter_js__WEBPACK_IMPORTED_MODULE_0___default().Constraint.create({ 
        label: 'Sprite Drag Constraint',
        pointA: mouse.position,
        pointB: { x: 0, y: 0 },
        length: 0.01, 
        stiffness: 0.1,
        angularStiffness: 1,
        render: {
            strokeStyle: '#90EE90',
            lineWidth: 3
        }
    });

    var spriteDragConstraint  = {
        type: 'spriteDragConstraint',
        mouse: mouse,
        element: canvas,
        body: null,
        constraint: constraint,
        collisionFilter: {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        }
    };

    matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.on(engine, 'beforeUpdate', function() {
        var allBodies = matter_js__WEBPACK_IMPORTED_MODULE_0___default().Composite.allBodies(engine.world);
        SpriteDragConstraint.update(spriteDragConstraint, allBodies);
        SpriteDragConstraint._triggerEvents(spriteDragConstraint);
    });

    return spriteDragConstraint;
};

/**
 * Updates the given mouse constraint.
 * @private
 * @method update
 * @param {SpriteDragConstraint} spriteDragConstraint
 * @param {body[]} bodies
 */
SpriteDragConstraint.update = function(spriteDragConstraint, bodies) {
    var mouse = spriteDragConstraint.mouse,
        constraint = spriteDragConstraint.constraint,
        body = spriteDragConstraint.body;
    if (mouse.button === 0) {
        if (!constraint.bodyB) {
            for (var i = 0; i < bodies.length; i++) {
                body = bodies[i];
                if (body.plugin.drag 
                        && matter_js__WEBPACK_IMPORTED_MODULE_0___default().Bounds.contains(body.bounds, mouse.position) 
                        && matter_js__WEBPACK_IMPORTED_MODULE_0___default().Detector.canCollide(body.collisionFilter, spriteDragConstraint.collisionFilter)) {
                    
                    for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        if (matter_js__WEBPACK_IMPORTED_MODULE_0___default().Vertices.contains(part.vertices, mouse.position)) {
                            constraint.pointA = mouse.position;
                            constraint.bodyB = spriteDragConstraint.body = body;
                            constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                            constraint.angleB = body.angle;
                            
                            matter_js__WEBPACK_IMPORTED_MODULE_0___default().Sleeping.set(body, false);
                            matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.trigger(spriteDragConstraint, 'startdrag', { mouse: mouse, body: body });

                            break;
                        }
                    }
                }
            }
        } else {
            matter_js__WEBPACK_IMPORTED_MODULE_0___default().Sleeping.set(constraint.bodyB, false);
            constraint.pointA = mouse.position;
        }
    } else {
        constraint.bodyB = spriteDragConstraint.body = null;
        constraint.pointB = null;

        if (body)
            matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.trigger(spriteDragConstraint, 'enddrag', { mouse: mouse, body: body });
    }
};

/**
 * Triggers mouse constraint events.
 * @method _triggerEvents
 * @private
 * @param {mouse} spriteDragConstraint
 */
SpriteDragConstraint._triggerEvents = function(spriteDragConstraint) {
    var mouse = spriteDragConstraint.mouse,
        mouseEvents = mouse.sourceEvents;

    if (mouseEvents.mousemove)
        matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.trigger(spriteDragConstraint, 'mousemove', { mouse: mouse });

    if (mouseEvents.mousedown)
        matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.trigger(spriteDragConstraint, 'mousedown', { mouse: mouse });

    if (mouseEvents.mouseup)
        matter_js__WEBPACK_IMPORTED_MODULE_0___default().Events.trigger(spriteDragConstraint, 'mouseup', { mouse: mouse });

    // reset the mouse state ready for the next step
    matter_js__WEBPACK_IMPORTED_MODULE_0___default().Mouse.clearSourceEvents(mouse);
};


/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   getPointerPos: () => (/* binding */ getPointerPos),
/* harmony export */   pixelToTile: () => (/* binding */ pixelToTile)
/* harmony export */ });
function getPointerPos(canvas, event) {
    const canvasScaleX = canvas.offsetWidth / canvas.width;
    const canvasScaleY = canvas.offsetHeight / canvas.height;
    const x = Math.floor(event.offsetX / canvasScaleX)
    const y = Math.floor(event.offsetY / canvasScaleY)
    return { x: x, y: y };
}

function pixelToTile(coords) {
    return { x: Math.floor(coords.x / 16), y: Math.floor(coords.y / 16) };
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}


/***/ }),

/***/ "?3254":
/*!*********************!*\
  !*** url (ignored) ***!
  \*********************/
/***/ (() => {

/* (ignored) */

/***/ })

}]);
//# sourceMappingURL=src_engine_js.bundle.js.map