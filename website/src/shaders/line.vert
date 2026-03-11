#version 300 es
in vec2 vPosition;
in vec4 vColor;
in float vOffset;

uniform highp vec4 uView;

out vec4 fColor;
out float fOffset;

const int atlasWidth = 64;

void main() {
  vec2 pos = (vPosition + uView.xy) / uView.zw * 2.0 - 1.0;
  pos.y *= -1.0;
  gl_Position = vec4(pos, 0.0, 1.0);
  fColor = vColor;
  fOffset = vOffset;
}