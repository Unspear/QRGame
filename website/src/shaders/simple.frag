#version 300 es
precision highp float;

in vec2 fTexCoord;
in vec4 fBackColor;
in vec4 fFrontColor;

out vec4 outColor;

uniform mediump sampler2D uSampler;

void main() {
  //vec4 value = texture(uSampler, fTexCoord);
  outColor = (1.0 > 0.5) ? fFrontColor : fBackColor;
}