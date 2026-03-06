import {Game} from './game'
import makeAirHockey from './games/airHockey'
import makeDaisy from './games/daisy'
import makeInfinity from './games/infinity'
type LibraryEntry = {
    game: Game,
    title: string,
    description: string
}
const games: LibraryEntry[] = [
    {
        game: new Game(""),
        title: "Blank Game",
        description: "An empty game with no code or level data"
    },
    {
        game: makeAirHockey(),
        title: "Air Hockey",
        description: "A 2-player air hockey game"
    },
    {
        game: makeDaisy(),
        title: "Daisy Bell",
        description: "A demo showing text-to-speech and sprite manipulation"
    },
    {
        game: makeInfinity(),
        title: "Repeating Pattern",
        description: "A demo showing camera movement and the tile patch system"
    }
];
export default games;