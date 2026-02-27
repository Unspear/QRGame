import './page';
import {Editor} from './editor'
import {urlToGame} from './pack'
import { Player } from './player';

const editor = new Editor(urlToGame());
const player = new Player(() => editor.getGame());