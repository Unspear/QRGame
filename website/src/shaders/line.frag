#version 300 es
precision highp float;

in vec4 fColor;
in float fOffset;

uniform vec3 uLinePattern;

out vec4 outColor;

void main() {
  outColor = fColor;
  float offset = fOffset + uLinePattern[0] + 0.001;
  offset = mod(offset, uLinePattern[1]);
  if (offset < uLinePattern[2]) {
    outColor.rgb = vec3(0);
  }
}