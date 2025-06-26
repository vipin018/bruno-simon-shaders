precision mediump float;

varying vec2 vUv;
uniform float uTime;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

float sdTriangle(vec2 p) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - 0.5;
    p.y += 0.3;
    if (p.x + k * p.y > 0.0) p = (vec2(p.x - k * p.y, -k * p.x - p.y)) / 2.0;
    p.x -= clamp(p.x, -1.0, 0.0);
    return -length(p) * sign(p.y);
}

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.2, 0.8);
    vec3 b = vec3(0.5, 0.4, 0.3);
    vec3 c = vec3(2.0, 1.0, 0.0);
    vec3 d = vec3(0.50, 0.20, 0.25);
    return a + b * cos(6.2831 * (c * t + d));
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = uTime * 0.8;

    // Swirl effect
    float angle = atan(uv.y, uv.x) + sin(t + length(uv) * 10.0) * 0.6;
    float radius = length(uv);
    uv = vec2(cos(angle), sin(angle)) * radius;

    // Ripple distortion
    uv.y += sin(uv.x * 8.0 + t * 2.5) * 0.08;
    uv.x += cos(uv.y * 6.0 - t * 2.0) * 0.05;

    float d = sdTriangle(uv);
    float shape = smoothstep(1.5, -0.05, d);
    float edgeGlow = smoothstep(0.03, 0.01, abs(d));
    float pulse = 1.5 + 0.5 * sin(t * 3.0 + length(uv) * 8.0);

    vec3 col = palette(radius + t * 0.1 + shape);

    vec3 finalColor = col * shape + vec3(1.0, 0.2, 1.0) * edgeGlow * pulse;

    gl_FragColor = vec4(finalColor, 1.0);
}
