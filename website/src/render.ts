import Chars from './chars.png';
import CharsText from './chars.txt?raw'
import { CHAR_WIDTH, PALETTE } from './constants';

type SpriteSheetEntry = {
  index: number;
  isFullWidth: boolean;
};

class CharRenderer {
    drawBuffer: HTMLCanvasElement;
    dbctx: CanvasRenderingContext2D;
    spriteSheet: HTMLImageElement;
    spriteSheetData: Record<number, SpriteSheetEntry>;
   constructor() {
        this.drawBuffer = document.createElement('canvas');
        this.drawBuffer.width = CHAR_WIDTH;
        this.drawBuffer.height = CHAR_WIDTH;
        this.dbctx = this.drawBuffer.getContext('2d')!;
        this.spriteSheet = new Image();
        this.spriteSheet.src = Chars;
        this.spriteSheetData = {};
        let lines = CharsText.split('\n');
        for (let i = 0; i < lines.length; i++)
        {
            let l = lines[i].split(',');
            this.spriteSheetData[parseInt(l[0])] = {
                index: i,
                isFullWidth: l[1] > 0
            }
        }
    }
   draw(context: CanvasRenderingContext2D, codePoints: number[], colors: number[], posX: number, posY: number, pivotX: number, pivotY: number, wrap: number, compact: boolean) {
        console.assert(codePoints.length == colors.length)
        context.fillStyle = "white";
        // Find layout
        let offsets = []
        let offsetX = 0;
        let offsetY = 0;
        for (let i = 0; i < codePoints.length; i++) {
            let codepoint = codePoints[i];
            if (!(codepoint in this.spriteSheetData)) {
                codepoint = 0;// NUL character
            }
            const data = this.spriteSheetData[codepoint];
            const isFullWidth = !compact || data.isFullWidth;
            const width = isFullWidth ? CHAR_WIDTH : CHAR_WIDTH / 2;
            if (wrap > 0 && offsetX + width > wrap * CHAR_WIDTH)
            {
                offsetX = 0;
                offsetY += CHAR_WIDTH;
            }
            offsets.push({ x: offsetX, y: offsetY });
            // Update offset
            offsetX += width
        }
        // Calc width and height
        let width = wrap > 0 ? wrap * CHAR_WIDTH : offsetX;
        let height = codePoints.length > 0 ? offsetY + CHAR_WIDTH : 0;
        // Draw
        let roundedX = Math.round(posX - width * pivotX);
        let roundedY = Math.round(posY - height * pivotY);
        const spriteSheetWidth = this.spriteSheet.width / CHAR_WIDTH;
        for (let i = 0; i < codePoints.length; i++) {
            let codepoint = codePoints[i];
            let offset = offsets[i];
            const color = PALETTE[colors[i] % PALETTE.length];
            const inverted = Math.floor(colors[i] / PALETTE.length) % 2 === 1
            if (!(codepoint in this.spriteSheetData)) {
                codepoint = 0;// NUL character
            }
            const data = this.spriteSheetData[codepoint];
            const x = (data.index % spriteSheetWidth);
            const y = Math.floor(data.index / spriteSheetWidth);
            const isFullWidth = !compact || data.isFullWidth;
            // https://stackoverflow.com/a/4231508
            this.dbctx.fillStyle = color;
            this.dbctx.globalCompositeOperation = "source-over";
            this.dbctx.fillRect(0, 0, this.drawBuffer.width, this.drawBuffer.height);
            if (inverted) {
                this.dbctx.globalCompositeOperation = "destination-out";
            }
            else{
                this.dbctx.globalCompositeOperation = "destination-atop";
            }
            this.dbctx.drawImage(this.spriteSheet, x * CHAR_WIDTH, y * CHAR_WIDTH, CHAR_WIDTH, CHAR_WIDTH, 0, 0, CHAR_WIDTH, CHAR_WIDTH);
            if (isFullWidth)
            {
                context.drawImage(this.drawBuffer, roundedX + offset.x, roundedY + offset.y);
            }
            else
            {
                context.drawImage(this.drawBuffer, CHAR_WIDTH / 4, 0, CHAR_WIDTH / 2, CHAR_WIDTH, roundedX + offset.x, roundedY + offset.y, CHAR_WIDTH / 2, CHAR_WIDTH);
            }
        }
    }
}

export default new CharRenderer();