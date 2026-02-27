export type Point = {
    x: number;
    y: number;
}

export type Dimensions = {
    w: number;
    h: number;
}

export function getPointerPos(canvas: HTMLCanvasElement, event: PointerEvent): Point {
    const canvasScaleX = canvas.offsetWidth / canvas.width;
    const canvasScaleY = canvas.offsetHeight / canvas.height;
    const x = Math.floor(event.offsetX / canvasScaleX)
    const y = Math.floor(event.offsetY / canvasScaleY)
    return { x: x, y: y };
}

export function pixelToTile(coords: Point): Point {
    return { x: Math.floor(coords.x / 16), y: Math.floor(coords.y / 16) };
}

export function clamp(number: number, min: number, max: number): number {
  return Math.max(min, Math.min(number, max));
}

export function stringToCodePoints(string: string): number[] {
    return [...string].map(c => c.codePointAt(0) ?? 0);
}