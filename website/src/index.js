import './style.css';
import _ from './pwa.js'
import {Game} from './game.js'
import {gameToUrl} from './pack.js'
import PongText from './games/pong.txt?raw'

const playButton = document.getElementById('play-button');
const editButton = document.getElementById('edit-button');
const gamesSelect = document.getElementById('games');

const games = {
    "none" : new Game(""),
    "pong" : new Game(PongText)
}

playButton.onclick = function(){
    window.location.href = gameToUrl(games[gamesSelect.value], "play");
}
editButton.onclick = function(){
    window.location.href = gameToUrl(games[gamesSelect.value], "edit");
}