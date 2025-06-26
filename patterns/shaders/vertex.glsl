uniform float uTime;
uniform vec2 uFrequency;
varying vec2 vUv;

void main() {
  vUv = uv; // set it early

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//   modelPosition.z += sin(modelPosition.x * 10.0 + uTime) * 0.5 +
//                      cos(modelPosition.y * 10.0 + uTime) * 0.5;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
