precision mediump float;


varying vec2 vUv;

void main(){
    
    float strength = vUv.y*vUv.x;
    gl_FragColor = vec4(vec3(strength), 1.0);
}