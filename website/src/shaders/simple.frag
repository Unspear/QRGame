#version 300 es
precision highp float;

in vec2 fTexCoord;
in vec4 fBackColor;
in vec4 fFrontColor;

out vec4 outColor;

uniform mediump sampler2D uSampler;

void main() {
  float value = texture(uSampler, fTexCoord).a;
  outColor = (value > 0.5) ? fFrontColor : fBackColor;
  if (outColor.a < 0.5) {
    discard;
  }
}