export function getPointerPos(canvas, event) {
    const canvasScaleX = canvas.offsetWidth / canvas.width;
    const canvasScaleY = canvas.offsetHeight / canvas.height;
    const x = Math.floor(event.offsetX / canvasScaleX)
    const y = Math.floor(event.offsetY / canvasScaleY)
    return { x: x, y: y };
}

export function pixelToTile(coords) {
    return { x: Math.floor(coords.x / 16), y: Math.floor(coords.y / 16) };
}

export function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
