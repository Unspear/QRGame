#version 300 es
in vec2 vPosition;
in vec2 vTexCoord;
in vec4 iBackColor;
in vec4 iFrontColor;
in vec2 iOffset;
in float iTexIndex;

uniform highp vec4 uView;

out vec2 fTexCoord;
out vec4 fBackColor;
out vec4 fFrontColor;

const int atlasWidth = 64;

void main() {
  gl_Position = vec4((vPosition + iOffset) / vec2(uView[2], uView[3]) * 2.0 - 1.0, 0.0, 1.0);
  int texX = int(iTexIndex) % atlasWidth;
  int texY = int(iTexIndex) / atlasWidth;
  fTexCoord = (vTexCoord + vec2(float(texX), float(texY))) / float(atlasWidth);
  fBackColor = iBackColor;
  fFrontColor = iFrontColor;
}