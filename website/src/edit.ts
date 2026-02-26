import './style.css';
import {EditorView, basicSetup} from 'codemirror'
import {StreamLanguage} from '@codemirror/language'
import {lua} from '@codemirror/legacy-modes/mode/lua'
import {Game} from './game'
import {Editor} from './editor'
import './pwa'
import {urlToGame} from './pack'
import { Player } from './player';

// DOM
const codeContent = document.getElementById('tab-content-code') as HTMLElement;
// Load game from URL into editor
let game = urlToGame();
let scriptInput = new EditorView({
    extensions: [basicSetup, StreamLanguage.define(lua)],
    parent: codeContent
})
const transaction = scriptInput.state.update({changes: {
    from: 0, 
    to: scriptInput.state.doc.length, 
    insert: game.script
}});
scriptInput.update([transaction]);
const editor = new Editor(game.tileMap);
function editorToGame() {
    return new Game(scriptInput.state.doc.toString(), editor.tileMap);
}
const player = new Player(editorToGame);