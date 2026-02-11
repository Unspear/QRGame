import PPMd from "./compiled/ppmd.js";
var MyPPMd = await PPMd({});

export function compress(data) {
    // Will destroy contents if it already exists (which is what we want)
    var inputFile = MyPPMd.FS.open("plain.txt", "w+");
    MyPPMd.FS.write(inputFile, data, 0, data.length, 0)
    MyPPMd.FS.close(inputFile);
    MyPPMd.ccall("encode", null, ["string", "string"], ["plain.txt", "encoded.pmd"]);
    // Read file into utf8 buffer
    return MyPPMd.FS.readFile("encoded.pmd");
}

export function decompress(data) {
    // Will destroy contents if it already exists (which is what we want)
    var inputFile = MyPPMd.FS.open("encoded.pmd", "w+");
    MyPPMd.FS.write(inputFile, data, 0, data.length, 0)
    MyPPMd.FS.close(inputFile);
    MyPPMd.ccall("decode", null, ["string", "string"], ["encoded.pmd", "plain.txt"]);
    // Read file into utf8 buffer
    return MyPPMd.FS.readFile("plain.txt");
}