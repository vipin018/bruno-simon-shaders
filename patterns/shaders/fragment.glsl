precision mediump float;

uniform float uTime;
varying vec2 vUv;

// Random
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Smooth interpolation
vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// 2D noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = fade(f);
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;

    // Time animation
    vec2 motion1 = uv + vec2(uTime * 0.03, 0.0);
    vec2 motion2 = uv * 1.5 + vec2(-uTime * 0.015, 0.1);

    // Two layers of clouds
    float clouds1 = fbm(motion1 * 2.0);
    float clouds2 = fbm(motion2 * 3.5);

    float clouds = mix(clouds1, clouds2, 0.5);

    // Sun glow at center
    float sun = smoothstep(0.4, 0.0, length(uv)) * 1.2;
    vec3 sunColor = vec3(1.0, 0.8, 0.2);

    vec3 skyColor = vec3(0.6, 0.8, 1.0);     // sky blue
    vec3 cloudColor = vec3(1.0);             // white clouds

    // Blend cloud into sky
    vec3 base = mix(skyColor, cloudColor, smoothstep(0.4, 1.0, clouds));

    // Add sun glow
    base += sun * sunColor;

    gl_FragColor = vec4(base, 1.0);
}
