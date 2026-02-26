import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game'
import {Engine} from './engine'
import {gameToUrl} from './pack'

export type GameProvider = (() => Game);

export class Player {
    canvas: HTMLCanvasElement;
    playPauseButton: HTMLButtonElement;
    reloadButton: HTMLButtonElement;
    urlButton: HTMLButtonElement;
    qrButton: HTMLButtonElement;
    qrCanvas: HTMLCanvasElement;
    gameProvider: GameProvider;
    constructor(gameProvider: GameProvider) {
        this.gameProvider = gameProvider;
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.playPauseButton = document.getElementById('play-pause-button') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-button') as HTMLButtonElement;
        this.urlButton = document.getElementById('url-button') as HTMLButtonElement;
        this.qrButton = document.getElementById('qr-button') as HTMLButtonElement;
        this.qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;

        const engine = new Engine(this.canvas);
        engine.play(gameProvider() ?? new Game());
        const qrGenerateOptions = {
            minCorrectionLevel: correction.L
        }
        const qrImageOptions: ImageDataOptions = {
            on: [0, 0, 0, 255],
            off: [255, 255, 255, 255]
        }
        generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(this.qrCanvas, qrImageOptions);

        // Buttons
        let that = this;
        this.playPauseButton.onclick = async function(){
            engine.setPaused(!engine.isPaused());
        };
        this.reloadButton.onclick = async function(){
            engine.play(gameProvider() ?? new Game());
            generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(that.qrCanvas, qrImageOptions);
        };
        this.urlButton.onclick = async function(){
            navigator.clipboard.writeText(gameToUrl(engine.game));
        };
        this.qrButton.onclick = async function(){
            that.qrCanvas.toBlob(function(blob) {
                if (blob !== null) {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]); 
                } else {
                    throw "Blob was null, could not copy QR Image to clipboard";
                }
            });
        }
    }
}