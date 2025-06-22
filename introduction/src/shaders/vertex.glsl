precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uFreq;
uniform float uTime;

attribute vec3 position;
attribute float aRandom;
attribute vec2 uv;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main() {
    // Convert local mesh position to world space
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

float elevation = sin(modelPosition.x * uFreq.x + uTime) * 0.1;
    elevation += sin(modelPosition.y * uFreq.y + uTime) * 0.1;
    modelPosition.z += elevation;
    // Animate wave along z-axis using sine and time
    modelPosition.z += sin(modelPosition.x * uFreq.x + uTime) * 0.1;
    modelPosition.z += sin(modelPosition.y * uFreq.y + uTime) * 0.1;

    // You can add aRandom if you want more noise-y look:
    // modelPosition.z += aRandom * 0.1;

    // Convert to view space (from world space to camera space)
    vec4 viewPosition = viewMatrix * modelPosition;

    // Convert to clip space
    gl_Position = projectionMatrix * viewPosition;

    // Pass data to fragment shader
    vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;
}
