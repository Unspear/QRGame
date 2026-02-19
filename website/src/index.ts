import './style.css';
import './pwa.js'
import {Game} from './game.js'
import {gameToUrl} from './pack.js'
import makePong from './games/pong'

const playButton = document.getElementById('play-button') as HTMLButtonElement;
const editButton = document.getElementById('edit-button') as HTMLButtonElement;
const gamesSelect = document.getElementById('games') as HTMLSelectElement;

const games: { [id: string] : Game; } = {
    "none" : new Game(""),
    "pong" : makePong()
}

playButton.onclick = function(){
    window.location.href = gameToUrl(games[gamesSelect.value], "play");
}
editButton.onclick = function(){
    window.location.href = gameToUrl(games[gamesSelect.value], "edit");
}