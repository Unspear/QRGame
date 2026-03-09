import './page'
import {gameToUrl} from './pack'
import library from './library'
import { Renderer } from './render';

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

// Source: https://indigocode.dev/tutorials/webgl/01-hello-triangle
// Source: https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.html
let canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
let renderer = new Renderer(canvas);