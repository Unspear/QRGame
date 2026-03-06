import './page'
import {gameToUrl} from './pack'
import library from './library'

for(const entry of library) {
    let a = document.createElement('a');
    a.href = gameToUrl(entry.game, "play");
    a.text = entry.title;
    document.body.appendChild(a);
    document.body.appendChild(document.createTextNode(" - "+entry.description));
    document.body.appendChild(document.createElement('br'));
}