import {Game} from './game'
import makePong from './games/pong'
import makeDaisy from './games/daisy'
import makeInfinity from './games/infinity'
const games: { [id: string] : Game; } = {
    "none" : new Game(""),
    "pong" : makePong(),
    "daisy" : makeDaisy(),
    "infinity" : makeInfinity(),
}
export default games;