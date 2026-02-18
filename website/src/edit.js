import './style.css';
import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game.js'
import {Engine} from './engine.js'
import {Editor} from './editor.js'
import benchmark from './benchmark.js';
import _ from './pwa.js'
import {urlToGame, gameToUrl} from './pack.js'

// DOM

const gameCanvas = document.getElementById('game-canvas');
const editorCanvas = document.getElementById('editor-canvas');
const editorCharInput = document.getElementById('editor-char-input');
const editorColorInput = document.getElementById('editor-color-input');
const editorInvertInput = document.getElementById('editor-invert-input');
const codeContent = document.getElementById('tab-content-code');
const reloadButton = document.getElementById('reload-button');
const urlButton = document.getElementById('url-button');
const qrButton = document.getElementById('qr-button');
const qrCanvas = document.getElementById('qr-canvas');

// Script Editor
let scriptInput = new EditorView({
    extensions: [basicSetup, StreamLanguage.define(lua)],
    parent: codeContent
})
function gameToEditor(game) {
    const transaction = scriptInput.state.update({changes: {
        from: 0, 
        to: scriptInput.state.doc.length, 
        insert: game.script
    }});
    scriptInput.update([transaction]);
}
function editorToGame() {
    return new Game(scriptInput.state.doc.toString(), editor.tileMap);
}
// Editor
const editor = new Editor(editorCanvas, editorCharInput, editorColorInput, editorInvertInput);
// Engine
const engine = new Engine(gameCanvas);
let game = urlToGame();
gameToEditor(game);
// (could load the game directly here but want to make sure the editor works properly)
engine.play(editorToGame());
const qrGenerateOptions = {
    minCorrectionLevel: correction.L
}
const qrImageOptions = {
    on: [0, 0, 0, 255],
    off: [255, 255, 255, 255]
}
generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(qrCanvas, qrImageOptions);

// Buttons
reloadButton.onclick = async function(){
    engine.play(editorToGame());
    generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(qrCanvas, qrImageOptions);
    benchmark(engine.game);
};
urlButton.onclick = async function(){
    navigator.clipboard.writeText(gameToUrl(engine.game));
};
qrButton.onclick = async function(){
    qrCanvas.toBlob(function(blob) { 
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]); 
    });
}