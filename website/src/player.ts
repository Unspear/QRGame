import {correction, generate, ImageDataOptions} from 'lean-qr'
import {Game} from './game'
import {Engine} from './engine'
import {gameToUrl} from './pack'

export type GameProvider = (() => Game);

export class Player {
    canvas: HTMLCanvasElement;
    errors: HTMLDivElement;
    playButton: HTMLButtonElement;
    pauseButton: HTMLButtonElement;
    reloadButton: HTMLButtonElement;
    playMenuDiv: HTMLDivElement
    urlButton: HTMLButtonElement;
    qrButton: HTMLButtonElement;
    qrCanvas: HTMLCanvasElement;
    gameTitle: HTMLElement;
    openEditorButton: HTMLButtonElement;
    closeEditorButton: HTMLButtonElement;
    gameDescription: HTMLElement;
    game: Game;
    gameProvider: GameProvider;
    constructor(gameProvider: GameProvider, isEditor: boolean) {
        if ((navigator as any).audioSession) {
            (navigator as any).audioSession.type = "playback";
        }
        this.gameProvider = gameProvider;
        this.game = gameProvider();
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.errors = document.getElementById('game-errors') as HTMLDivElement;
        this.playButton = document.getElementById('play-button') as HTMLButtonElement;
        this.pauseButton = document.getElementById('pause-button') as HTMLButtonElement;
        this.reloadButton = document.getElementById('reload-button') as HTMLButtonElement;
        this.playMenuDiv = document.getElementById('play-menu') as HTMLDivElement;
        this.urlButton = document.getElementById('url-button') as HTMLButtonElement;
        this.qrButton = document.getElementById('qr-button') as HTMLButtonElement;
        this.qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        this.openEditorButton = document.getElementById('open-editor-button') as HTMLButtonElement;
        this.closeEditorButton = document.getElementById('close-editor-button') as HTMLButtonElement;
        if (isEditor) {
            this.openEditorButton.classList.toggle("hidden", true);
        }else {
            this.closeEditorButton.classList.toggle("hidden", true);
        }
        this.gameTitle = document.getElementById('game-title') as HTMLElement;
        this.gameDescription = document.getElementById('game-description') as HTMLElement;

        const engine = new Engine(this.canvas, this.errors);
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
            const gameUrl = gameToUrl(this.game);
            try {
                navigator.share({ url: gameUrl });
            } catch (error) {
                try {
                    navigator.clipboard.writeText(gameUrl);
                } catch (error) {
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
                    navigator.share({files: files});
                } catch (error) {
                    try {
                        const item = new ClipboardItem({ "image/png": blob });
                        navigator.clipboard.write([item]); 
                    } catch (error) {
                        console.error("Failed to share QR code");
                    }
                }
            });
        }
        this.openEditorButton.onclick = () => {
            window.location.href = gameToUrl(this.game, "edit");
        }
        this.closeEditorButton.onclick = () => {
            window.location.href = gameToUrl(this.game, "play");
        }
    }
    updatePlayer() {
        const qrGenerateOptions = {
            minCorrectionLevel: correction.L
        }
        const qrImageOptions: ImageDataOptions = {
            on: [0, 0, 0, 255],
            off: [255, 255, 255, 255],
            pad: 1,
        }
        generate(gameToUrl(this.game), qrGenerateOptions).toCanvas(this.qrCanvas, qrImageOptions);
        this.gameTitle.innerText = this.game.metadata.title;
        this.gameDescription.innerText = this.game.metadata.description;
    }
}