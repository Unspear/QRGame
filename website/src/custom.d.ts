declare module "*.jpg";
declare module "*.png";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.wasm";
// Text Files
declare module "*.txt" {
  const content: string;
  export default content;
}
declare module "*.vert" {
  const content: string;
  export default content;
}
declare module "*.frag" {
  const content: string;
  export default content;
}
declare module "@jstarpl/mml-iterator" {
  export type NoteEvent = {
    type: "note",
    time: number,
    duration: number,
    noteNumber: number,
    quantize: number,
    velocity: number,
  }
  export type EndEvent = {
    type: "end",
    time: number,
  }
  class MMLIterator {
    constructor(string: string);
    [Symbol.iterator](): Iterator<NoteEvent | EndEvent>;
  }
  export default MMLIterator;
}