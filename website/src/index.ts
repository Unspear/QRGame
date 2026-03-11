import './page'
import {gameToUrl} from './pack'
import library from './library'

const demoParent = document.getElementById("demos") as HTMLElement;

for(const entry of library) {
    let p = document.createElement('p');
    let a = document.createElement('a');
    a.href = gameToUrl(entry.game, "play");
    a.text = entry.title;
    p.appendChild(a);
    p.appendChild(document.createTextNode(" - " + entry.description));
    demoParent.appendChild(p);
}