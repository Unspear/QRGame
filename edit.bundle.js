/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./edit.ts"
/*!*****************!*\
  !*** ./edit.ts ***!
  \*****************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./page */ "./page.js");
/* harmony import */ var _editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editor */ "./editor.ts");
/* harmony import */ var _pack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pack */ "./pack.ts");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./player */ "./player.ts");
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pack__WEBPACK_IMPORTED_MODULE_2__, _player__WEBPACK_IMPORTED_MODULE_3__]);
([_pack__WEBPACK_IMPORTED_MODULE_2__, _player__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);




const editor = new _editor__WEBPACK_IMPORTED_MODULE_1__.Editor((0,_pack__WEBPACK_IMPORTED_MODULE_2__.urlToGame)());
const player = new _player__WEBPACK_IMPORTED_MODULE_3__.Player(() => editor.getGame());

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ },

/***/ "./editor.ts"
/*!*******************!*\
  !*** ./editor.ts ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Editor: () => (/* binding */ Editor)
/* harmony export */ });
/* harmony import */ var codemirror__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! codemirror */ "../node_modules/codemirror/dist/index.js");
/* harmony import */ var codemirror__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! codemirror */ "../node_modules/@codemirror/view/dist/index.js");
/* harmony import */ var _codemirror_language__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @codemirror/language */ "../node_modules/@codemirror/language/dist/index.js");
/* harmony import */ var _codemirror_legacy_modes_mode_lua__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @codemirror/legacy-modes/mode/lua */ "../node_modules/@codemirror/legacy-modes/mode/lua.js");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./camera */ "./camera.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./game */ "./game.ts");
/* harmony import */ var _tile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./tile */ "./tile.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./util */ "./util.ts");
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./render */ "./render.ts");








var EditorState;
(function (EditorState) {
    EditorState[EditorState["Brush"] = 0] = "Brush";
    EditorState[EditorState["Pipette"] = 1] = "Pipette";
})(EditorState || (EditorState = {}));
const TabDrawTile = "draw-tile";
const TabDrawPatch = "draw-patch";
class Editor {
    // Code
    scriptInput;
    // Canvas
    canvas;
    // Tabs
    tileMapTab;
    // Settings
    widthInput;
    heightInput;
    patchCountInput;
    patchWidthInput;
    patchHeightInput;
    applySettingsButton;
    // Draw Tilemap
    charInput;
    colorInput;
    invertedInput;
    invertedLabel;
    pipetteButton;
    // Draw Patchmap
    patchIdInput;
    // Physics
    solidCharInput;
    // Camera
    leftButton;
    upButton;
    rightButton;
    downButton;
    // Import/Export
    exportButton;
    importButton;
    // Other
    renderer;
    heldDown;
    camera;
    tileMap;
    patchMap;
    state;
    constructor(inputGame) {
        this.state = EditorState.Brush;
        //Code
        const codeContent = document.getElementById('tab-content-code');
        this.scriptInput = new codemirror__WEBPACK_IMPORTED_MODULE_1__.EditorView({
            extensions: [codemirror__WEBPACK_IMPORTED_MODULE_0__.basicSetup, _codemirror_language__WEBPACK_IMPORTED_MODULE_2__.StreamLanguage.define(_codemirror_legacy_modes_mode_lua__WEBPACK_IMPORTED_MODULE_3__.lua)],
            parent: codeContent
        });
        //Canvas
        this.canvas = document.getElementById('editor-canvas');
        //Tabs
        this.tileMapTab = document.getElementById('tilemap-tab');
        //Settings
        this.widthInput = document.getElementById('tilemap-width');
        this.heightInput = document.getElementById('tilemap-height');
        this.patchCountInput = document.getElementById('patch-count');
        this.patchWidthInput = document.getElementById('patch-width');
        this.patchHeightInput = document.getElementById('patch-height');
        this.applySettingsButton = document.getElementById('tilemap-settings-apply');
        //Drawing
        this.charInput = document.getElementById('editor-char-input');
        this.colorInput = document.getElementById('editor-color-input');
        this.invertedInput = document.getElementById('editor-invert-input');
        this.invertedLabel = document.getElementById('editor-invert-label');
        this.pipetteButton = document.getElementById('editor-pipette-button');
        //Patch Drawing
        this.patchIdInput = document.getElementById('patch-id');
        //Physics
        this.solidCharInput = document.getElementById('editor-solid-input');
        //Camera
        this.leftButton = document.getElementById('left-button');
        this.upButton = document.getElementById('up-button');
        this.rightButton = document.getElementById('right-button');
        this.downButton = document.getElementById('down-button');
        //Import/Export
        this.exportButton = document.getElementById('export-button');
        this.importButton = document.getElementById('import-button');
        this.renderer = new _render__WEBPACK_IMPORTED_MODULE_8__.Renderer(this.canvas);
        this.heldDown = false;
        this.camera = new _camera__WEBPACK_IMPORTED_MODULE_4__.Camera();
        // Place tile while pointer is held
        this.canvas.addEventListener('pointerdown', (event) => {
            this.heldDown = true;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                    this.setTileFromEvent(event);
                }
                else {
                    this.setBrushFromEvent(event);
                }
            }
            else if (this.tileMapTab.currentTab === TabDrawPatch) {
                this.setPatchFromEvent(event);
            }
        });
        window.addEventListener('pointerup', (event) => {
            this.heldDown = false;
            if (this.tileMapTab.currentTab === TabDrawTile) {
                if (this.state === EditorState.Brush) {
                }
                else {
                    this.state = EditorState.Brush;
                }
            }
            else if (this.tileMapTab.currentTab === TabDrawPatch) {
            }
        });
        this.canvas.addEventListener('pointermove', (event) => {
            if (this.heldDown) {
                if (this.tileMapTab.currentTab === TabDrawTile) {
                    if (this.state === EditorState.Brush) {
                        this.setTileFromEvent(event);
                    }
                }
                else if (this.tileMapTab.currentTab === TabDrawPatch) {
                    this.setPatchFromEvent(event);
                }
            }
        });
        // Nuke default touch behaviour (pull down screen to reload)
        this.canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (event) => event.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
        let that = this;
        this.tileMapTab.updateListeners.push(function (currentTab) {
        });
        this.applySettingsButton.onclick = function () {
            // Make new tilemap with new size and copy data
            const patchDim = {
                w: that.getAndValidateInputNumber(that.patchWidthInput, 1, 32, 1),
                h: that.getAndValidateInputNumber(that.patchHeightInput, 1, 32, 1),
            };
            const newPatchCount = that.getAndValidateInputNumber(that.patchCountInput, 1, 128, 1);
            const newTileMap = new _tile__WEBPACK_IMPORTED_MODULE_6__.TileMap(patchDim, newPatchCount);
            for (let i = 0; i < newPatchCount; i++) {
                for (let y = 0; y < patchDim.h; y++) {
                    for (let x = 0; x < patchDim.w; x++) {
                        const coords = { x: x, y: y };
                        const getTileResult = that.tileMap.getTile(coords, i);
                        if (getTileResult !== null) {
                            newTileMap.setTile(getTileResult, coords, i);
                        }
                    }
                }
            }
            that.tileMap = newTileMap;
            const newDim = {
                w: that.getAndValidateInputNumber(that.widthInput, 1, 128, 1),
                h: that.getAndValidateInputNumber(that.heightInput, 1, 128, 1),
            };
            const newPatchMap = new _tile__WEBPACK_IMPORTED_MODULE_6__.PatchMap(newDim);
            for (let y = 0; y < newDim.h; y++) {
                for (let x = 0; x < newDim.w; x++) {
                    const coords = { x: x, y: y };
                    const getPatchResult = that.patchMap.getPatch(coords);
                    if (getPatchResult !== null) {
                        newPatchMap.setPatch(getPatchResult, coords);
                    }
                }
            }
            that.patchMap = newPatchMap;
        };
        this.leftButton.onclick = function () { that.camera.x -= 64; };
        this.upButton.onclick = function () { that.camera.y -= 64; };
        this.rightButton.onclick = function () { that.camera.x += 64; };
        this.downButton.onclick = function () { that.camera.y += 64; };
        this.exportButton.onclick = function () {
            let serialised = JSON.stringify({ tileMap: that.tileMap, patchMap: that.patchMap });
            navigator.clipboard.writeText(serialised);
        };
        this.importButton.onclick = async function () {
            try {
                let serialised = JSON.parse(await navigator.clipboard.readText());
                that.tileMap = _tile__WEBPACK_IMPORTED_MODULE_6__.TileMap.Copy(serialised.tileMap);
                that.patchMap = _tile__WEBPACK_IMPORTED_MODULE_6__.PatchMap.Copy(serialised.patchMap);
            }
            catch (err) {
                alert("Failed to load tilemap from clipboard, are you sure it is in the clipboard and correctly formatted?");
            }
        };
        this.invertedLabel.classList.toggle("hidden", !this.invertedInput.checked);
        this.invertedInput.onchange = function () {
            that.invertedLabel.classList.toggle("hidden", !that.invertedInput.checked);
        };
        this.pipetteButton.onclick = function () {
            that.state = EditorState.Pipette;
        };
        // Load input game into editor
        const transaction = this.scriptInput.state.update({ changes: {
                from: 0,
                to: this.scriptInput.state.doc.length,
                insert: inputGame.script
            } });
        this.scriptInput.update([transaction]);
        this.tileMap = _tile__WEBPACK_IMPORTED_MODULE_6__.TileMap.Copy(inputGame.tileMap);
        this.patchMap = _tile__WEBPACK_IMPORTED_MODULE_6__.PatchMap.Copy(inputGame.patchMap);
        this.patchWidthInput.valueAsNumber = this.tileMap.dim.w;
        this.patchHeightInput.valueAsNumber = this.tileMap.dim.h;
        this.patchCountInput.valueAsNumber = this.tileMap.count;
        this.widthInput.valueAsNumber = this.patchMap.dim.w;
        this.heightInput.valueAsNumber = this.patchMap.dim.h;
        this.solidCharInput.value = String.fromCodePoint(...inputGame.solidTiles);
        this.renderer.startRenderLoop(() => this.draw());
    }
    getAndValidateInputNumber(input, min, max, step) {
        let value = input.valueAsNumber;
        value = _util__WEBPACK_IMPORTED_MODULE_7__.clamp(Math.ceil(value / step) * step, min, max);
        input.valueAsNumber = value;
        return value;
    }
    getCoordFromEvent(event) {
        let pixel = _util__WEBPACK_IMPORTED_MODULE_7__.getPointerPos(this.canvas, event);
        let viewOffset = this.camera.getViewOffset();
        pixel.x -= viewOffset.x;
        pixel.y -= viewOffset.y;
        return _util__WEBPACK_IMPORTED_MODULE_7__.pixelToTile(pixel);
    }
    setTileFromEvent(event) {
        // Get array of codepoints
        let codePoints = [...this.charInput.value].map(c => c.codePointAt(0) ?? 0);
        let color = parseInt(this.colorInput.value);
        const inverted = this.invertedInput.checked;
        if (inverted) {
            color += 8;
        }
        if (codePoints.length == 0) {
            // Erase
            codePoints = [' '.codePointAt(0)];
        }
        // Draw array to tilemap
        let pair = this.tileMap.getSplitCoords(this.getCoordFromEvent(event));
        for (const codePoint of codePoints) {
            this.tileMap.setTile({ codePoint: codePoint, color: color }, pair.coords, pair.patchIndex);
            pair.coords.x++;
        }
    }
    setPatchFromEvent(event) {
        this.patchMap.setPatch({ patchId: this.patchIdInput.valueAsNumber, transform: 0 }, this.getCoordFromEvent(event));
    }
    setBrushFromEvent(event) {
        let coords = this.getCoordFromEvent(event);
        let tileData = this.tileMap.getTile(coords);
        if (tileData !== null) {
            this.charInput.value = String.fromCodePoint(tileData.codePoint);
            this.colorInput.value = (tileData.color % 8).toString();
            this.invertedInput.checked = tileData.color > 8;
        }
    }
    draw() {
        this.renderer.beginFrame();
        if (this.tileMapTab.currentTab === TabDrawPatch) {
            this.patchMap.draw(this.renderer, this.camera.getViewOffset());
            this.patchMap.drawOutline(this.renderer, this.camera.getViewOffset());
        }
        else {
            this.tileMap.draw(this.renderer, this.camera.getViewOffset());
            this.tileMap.drawOutline(this.renderer, this.camera.getViewOffset());
        }
        this.renderer.endFrame();
    }
    getGame() {
        let game = new _game__WEBPACK_IMPORTED_MODULE_5__.Game(this.scriptInput.state.doc.toString(), this.tileMap, this.patchMap);
        game.solidTiles = _util__WEBPACK_IMPORTED_MODULE_7__.stringToCodePoints(this.solidCharInput.value);
        return game;
    }
}


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
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
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
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
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		// data-webpack is not used as build has no uniqueName
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 		
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
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
/******/ 			"edit": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_matter-js_build_matter_js","vendors-node_modules_sam-js_dist_samjs_esm_min_js-node_modules_wasmoon_dist_index_js-node_mod-cf248f","vendors-node_modules_codemirror_legacy-modes_mode_lua_js-node_modules_codemirror_dist_index_js","page_js-pack_ts","player_ts"], () => (__webpack_require__("./edit.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=edit.bundle.js.map