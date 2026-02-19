import './style.css';
import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game'
import {Engine} from './engine.js'
import './pwa.js'
import {urlToGame, gameToUrl} from './pack.js'

// DOM
const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const reloadButton = document.getElementById('reload-button') as HTMLButtonElement;
const urlButton = document.getElementById('url-button') as HTMLButtonElement;
const qrButton = document.getElementById('qr-button') as HTMLButtonElement;
const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;

// Engine
const engine = new Engine(gameCanvas);
let game = urlToGame();
if (game === null) {
    game = new Game();
}
// (could load the game directly here but want to make sure the editor works properly)
engine.play(game);
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
    engine.play(game);
    generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(qrCanvas, qrImageOptions);
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