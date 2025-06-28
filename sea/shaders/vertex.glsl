precision mediump float;

uniform float uTime;
uniform vec2 uFrequency;
varying vec2 vUv;

void main() {
  vUv = uv; 

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  modelPosition.z = sin(modelPosition.x * uFrequency.x + uTime) + 
                    sin(modelPosition.y * uFrequency.y + uTime);

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
