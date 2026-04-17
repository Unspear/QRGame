import { Dimensions } from "./util";

export const FRAME_TIME = 1.0 / 60.0
export const FRAME_TIME_MS = FRAME_TIME * 1000.0;

export const CHAR_WIDTH = 16;
export const SCREEN_TILES: Dimensions = {w: 12, h: 16};
export const SCREEN_DIM: Dimensions = {w: 192, h: 256};

export const PALETTE = [
    '#ffffff',
    '#636363',
    '#e91313',
    '#e5882A',
    '#ffcc00',
    '#00B000',
    '#3377dd',
    '#8e20bd',
]
export const PALETTE_FRACTIONS = [
    [1.00, 1.00, 1.00],
    [0.39, 0.39, 0.39],
    [0.91, 0.07, 0.07],
    [0.90, 0.53, 0.16],
    [1.00, 0.80, 0.00],
    [0.00, 0.70, 0.00],
    [0.20, 0.47, 0.87],
    [0.56, 0.13, 0.74]
]

export const PHYSICS_CATEGORY_TILE = 1;
export const PHYSICS_CATEGORY_SPRITE = 2;
export const PHYSICS_CATEGORY_SENSOR = 4;