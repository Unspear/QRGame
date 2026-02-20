import './style.css';
import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game'
import {Engine} from './engine'
import {Editor} from './editor'
import benchmark from './benchmark';
import './pwa'
import {urlToGame, gameToUrl} from './pack'

// DOM

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const codeContent = document.getElementById('tab-content-code');
const reloadButton = document.getElementById('reload-button') as HTMLButtonElement;
const urlButton = document.getElementById('url-button') as HTMLButtonElement;
const qrButton = document.getElementById('qr-button') as HTMLButtonElement;
const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;

// Script Editor
let scriptInput = new EditorView({
    extensions: [basicSetup, StreamLanguage.define(lua)],
    parent: codeContent
})
function gameToEditor(game: Game) {
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
const editor = new Editor();
// Engine
const engine = new Engine(gameCanvas);
let game = urlToGame();
gameToEditor(game);
// (could load the game directly here but want to make sure the editor works properly)
engine.play(editorToGame());
const qrGenerateOptions = {
    minCorrectionLevel: correction.L
}
const qrImageOptions: ImageDataOptions = {
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