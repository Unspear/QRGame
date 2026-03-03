import png
import unicodedataplus as ud
from collections import Counter


extra_chars = Counter()
#extra_chars.update(open('kaomoji.json', 'r', encoding="utf-8").read())
#extra_chars.update(open('emoticons.txt', 'r', encoding="utf-8").read())
#extra_chars = set(x for x, count in extra_chars.items() if count > 4 and ud.script(x) != 'Han')

blocks = set()
with open('blocks_by_char.txt', 'r', encoding="utf-8") as file:
    for c in file.read():
        blocks.add(ud.block(c))
        #print(c+" "+ud.block(c))

unidata = {}
lines = 0
with open('unifont.hex', 'r') as file:
    for line in file:
        lines += 1
        code, value = line.strip().split(':')
        index = int(code, 16)
        # Skip sensitive characters
        if index >= 0x0FD5 and index <= 0x0FD8:
            continue
        c = chr(index)
        if ud.category(c) != 'Mn':# Mn == Non-spacing e.i. combining which won't work on a tilemap
            if ud.is_extended_pictographic(c) or ud.block(c) in blocks or c in extra_chars:
                unidata[index] = value
            
print("Lines:"+str(lines))
print("Codepoints:"+str(len(unidata)))
width = 16
while width**2 < len(unidata):
    width *= 2
codepoints = list(unidata.keys())
print("Width:"+str(width))

atlas = [[0]*(width*16*2) for y in range(width*16)]
index = 0
unidata_width = {}
for code in sorted(unidata):
    value = unidata[code]
    ax = index % width
    ay = index // width
    fullwidth = (len(value) == 64)
    unidata_width[code] = fullwidth
    for cy in range(16):
        crow = None
        if fullwidth:
            crow = format(int(value[cy*4:cy*4+4], 16), "016b")
        else:
            crow = "0000"+format(int(value[cy*2:cy*2+2], 16), "08b")+"0000"
        for cx in range(16):
            atlas[ay*16+cy][(ax*16+cx)*2] = 1 #Luminance
            atlas[ay*16+cy][(ax*16+cx)*2+1] = int(crow[cx]) #Alpha
    index += 1

# Create and save chars
png.from_array(atlas, 'LA;1').save("chars.png")

with open("chars.txt", "w", encoding="utf-8") as f:
    for code in sorted(unidata):
        f.write(str(code)+","+str(int(unidata_width[code]))+"\n")

import subprocess

subprocess.run(["pingo", "-lossless", "-s4", "chars.png"]) 
