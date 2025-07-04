precision mediump float;

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying float vElevation;


void main(){

float mixstrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixstrength );
   
    gl_FragColor = vec4(color, 1.0);
}