#version 300 es
precision highp float;

in vec4 fColour;
in float fOffset;

uniform vec3 uLinePattern;

out vec4 outColour;

void main() {
  outColour = fColour;
  float offset = fOffset + uLinePattern[0] + 0.001;
  offset = mod(offset, uLinePattern[1]);
  if (offset < uLinePattern[2] && fColour.a == 1.0) {
    outColour.rgb = vec3(0);
  }
}