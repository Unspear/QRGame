import {Game} from './game'
import makePong from './games/pong'
const games: { [id: string] : Game; } = {
    "none" : new Game(""),
    "pong" : makePong()
}
export default games;