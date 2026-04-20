#version 300 es
precision highp float;

in vec2 fTexCoord;
in vec4 fBackColour;
in vec4 fFrontColour;

out vec4 outColour;

uniform mediump sampler2D uSampler;

void main() {
  float value = texture(uSampler, fTexCoord).a;
  outColour = (value > 0.5) ? fFrontColour : fBackColour;
  if (outColour.a < 0.5) {
    discard;
  }
}