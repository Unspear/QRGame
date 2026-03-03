import {Game} from './game'
import makePong from './games/pong'
import makeDaisy from './games/daisy'
const games: { [id: string] : Game; } = {
    "none" : new Game(""),
    "pong" : makePong(),
    "daisy" : makeDaisy()
}
export default games;