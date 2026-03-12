import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game'
import {Engine} from './engine'
import {gameToUrl} from './pack'

export type GameProvider = (() => Game);

export class Player {
    canvas: HTMLCanvasElement;
    playButton: HTMLButtonElement;
    pauseButton: HTMLButtonElement;
    reloadButton: HTMLButtonElement;
    playMenuDiv: HTMLDivElement
    //urlButton: HTMLButtonElement;
    //qrButton: HTMLButtonElement;
    //qrCanvas: HTMLCanvasElement;
    gameProvider: GameProvider;
    constructor(gameProvider: GameProvider) {
        this.gameProvider = gameProvider;
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        this.pauseButton = document.getElementById('pause-button') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-button') as HTMLButtonElement;
        this.playMenuDiv = document.getElementById('play-menu') as HTMLDivElement;

        //this.urlButton = document.getElementById('url-button') as HTMLButtonElement;
        //this.qrButton = document.getElementById('qr-button') as HTMLButtonElement;
        //this.qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;

        const engine = new Engine(this.canvas);
        /*const qrGenerateOptions = {
            minCorrectionLevel: correction.L
        }
        const qrImageOptions: ImageDataOptions = {
            on: [0, 0, 0, 255],
            off: [255, 255, 255, 255]
        }
        generate(gameToUrl(gameProvider()), qrGenerateOptions).toCanvas(this.qrCanvas, qrImageOptions);*/
        // Buttons
        let that = this;
        this.playButton.onclick = async function(){
            if (engine.game === undefined) {
                engine.play(gameProvider() ?? new Game());
            }
            engine.setPaused(false);
            that.playMenuDiv.classList.toggle("hidden", true);
            that.playButton.classList.toggle("hidden", true);
            that.pauseButton.classList.toggle("hidden", false);
            that.canvas.classList.toggle("hidden", false);
        };
         this.pauseButton.onclick = async function(){
            engine.setPaused(true);
            that.playMenuDiv.classList.toggle("hidden", false);
            that.playButton.classList.toggle("hidden", false);
            that.pauseButton.classList.toggle("hidden", true);
            that.canvas.classList.toggle("hidden", true);
        };
        this.reloadButton.onclick = async function(){
            engine.play(gameProvider() ?? new Game());
            engine.setPaused(false);
            //generate(gameToUrl(engine.game), qrGenerateOptions).toCanvas(that.qrCanvas, qrImageOptions);
        };
        /*this.urlButton.onclick = async function(){
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
        }*/
    }
}