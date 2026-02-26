import './page'
import {gameToUrl} from './pack'
import library from './library'

const playButton = document.getElementById('play-button') as HTMLButtonElement;
const editButton = document.getElementById('edit-button') as HTMLButtonElement;
const gamesSelect = document.getElementById('games') as HTMLSelectElement;

playButton.onclick = function(){
    window.location.href = gameToUrl(library[gamesSelect.value], "play");
}
editButton.onclick = function(){
    window.location.href = gameToUrl(library[gamesSelect.value], "edit");
}