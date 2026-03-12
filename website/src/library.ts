import {Game} from './game'
import makeAirHockey from './games/airHockey'
import makeDaisy from './games/daisy'
import makeInfinity from './games/infinity'
import makePlatformer from './games/platformer'
export default [new Game(), makeAirHockey(), makeDaisy(), makeInfinity(), makePlatformer()];