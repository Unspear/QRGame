import './page'
import {gameToUrl} from './pack'
import library from './library'

const demoParent = document.getElementById("demos") as HTMLElement;

for(const game of library) {
    let p = document.createElement('p');
    let a = document.createElement('a');
    a.href = gameToUrl(game, "play");
    a.text = game.metadata.title;
    p.appendChild(a);
    p.appendChild(document.createTextNode(" - " + game.metadata.description));
    demoParent.appendChild(p);
}