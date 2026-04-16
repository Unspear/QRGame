#version 300 es
in vec2 vPosition;
in vec2 vTexCoord;
in vec4 iBackColor;
in vec4 iFrontColor;
in vec2 iOffset;
in float iTexIndex;
in float iFlags;

uniform highp vec4 uView;

out vec2 fTexCoord;
out vec4 fBackColor;
out vec4 fFrontColor;

const int atlasWidth = 64;

void main() {
  vec2 pos = vPosition;
  vec2 tex = vTexCoord;
  bool isHalfWidth = mod(iFlags, 2.0) > 0.;
  bool fliph = mod(floor(iFlags / 2.0), 2.0) > 0.;
  bool flipv = mod(floor(iFlags / 4.0), 2.0) > 0.;
  if (isHalfWidth) {// isHalfWidth
    pos.x = pos.x * 0.5;
    tex.x = tex.x * 0.5 + 0.25;
  }
  if (fliph) {
    tex.x = 1.0 - tex.x;
  }
  if (flipv) {
    tex.y = 1.0 - tex.y;
  }
  pos = (pos + iOffset + uView.xy) / uView.zw * 2.0 - 1.0;
  pos.y *= -1.0;
  gl_Position = vec4(pos, 0.0, 1.0);
  int texX = int(iTexIndex) % atlasWidth;
  int texY = int(iTexIndex) / atlasWidth;
  fTexCoord = (tex + vec2(float(texX), float(texY))) / float(atlasWidth);
  fBackColor = iBackColor;
  fFrontColor = iFrontColor;
}