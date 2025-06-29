import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import VertexShader from './shaders/vertex.glsl';
import FragmentShader from './shaders/fragment.glsl';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';


/**
 * Base
 */
// Debug
const gui = new GUI();
gui.close();
const debugObject = {};
const textureLoader = new THREE.TextureLoader();
// Canvas
const canvas = document.querySelector('#canvas');

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('#000013'); // warm desert haze


/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);

// Colors
debugObject.depthColor = "#2ca9e8";
debugObject.surfaceColor = "#051d29";

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
  side: THREE.DoubleSide,
  // wireframe: true,
  uniforms: {
    uTime: { value: 0 },

    uBigWaveFrequency: { value: new THREE.Vector2(5.56, 4.41) }, // low freq = wide dunes
    uBigWaveElevation: { value: 0.03 }, // taller dunes
    uBigWaveSpeed: { value: 1.25 }, // very slow motion (almost static)

    uSmallWaveElevation: { value: 0.4 }, 
    uSmallWaveFrequency: { value: 0.5 }, 
    uSmallWaveSpeed: { value: 0.4 }, 
    uSmallWaveIteration: { value: 3 },
    
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.2 },
    uColorMultiplier: { value: 4.5 },

  },
});

gui.add(material.uniforms.uBigWaveElevation, 'value')
  .min(0).max(1).step(0.01)
  .name('Big Wave Elevation');

gui.add(material.uniforms.uBigWaveFrequency.value, 'x')
  .min(0).max(10).step(0.01)
  .name('Big Wave Frequency X');
gui.add(material.uniforms.uBigWaveFrequency.value, 'y')
  .min(0).max(10).step(0.01)
  .name('Big Wave Frequency Y');

gui.add(material.uniforms.uBigWaveSpeed, 'value')
  .min(0).max(5).step(0.01)
  .name('Big Wave Speed');

gui.add(material.uniforms.uSmallWaveElevation, 'value')
  .min(0).max(0.5).step(0.01)
  .name('Small Wave Elevation');

gui.add(material.uniforms.uSmallWaveFrequency, 'value')
  .min(0).max(30).step(0.1)
  .name('Small Wave Frequency');

gui.add(material.uniforms.uSmallWaveSpeed, 'value')
  .min(0).max(5).step(0.01)
  .name('Small Wave Speed');

gui.add(material.uniforms.uSmallWaveIteration, 'value')
  .min(1).max(8).step(1)
  .name('Small Wave Iteration');

gui.addColor(debugObject, 'depthColor')
  .name('Depth Color')
  .onChange(() => {
    material.uniforms.uDepthColor.value.set(debugObject.depthColor);
  });

gui.addColor(debugObject, 'surfaceColor')
  .name('Surface Color')
  .onChange(() => {
    material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
  });

gui.add(material.uniforms.uColorOffset, 'value')
  .min(0).max(1).step(0.01)
  .name('Color Offset');

gui.add(material.uniforms.uColorMultiplier, 'value')
  .min(0).max(5).step(0.01)
  .name('Color Multiplier');


// Mesh
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI * 0.5;
scene.add(mesh);

// moon
// Create moon geometry
const moonGeometry = new THREE.SphereGeometry(1, 32, 32); 
const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);

// Position it where the point light is
moon.position.set(0, 2, -15);
scene.add(moon);
moon.scale.set(2,2,2); // Scale it up for visibility

textureLoader.load('/texture.webp', (texture) => {
  moonMaterial.map = texture;
  moonMaterial.needsUpdate = true; // Ensure the material updates with the new texture
})


// stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 100;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.5,
  sizeAttenuation: true, // smaller when farther
  transparent: true,
  opacity: 0.8,
  depthWrite: false, // avoid z-fighting
  blending: THREE.AdditiveBlending,
  
});

textureLoader.load('/star.webp', (starTex) => {
  starMaterial.map = starTex;
  starMaterial.needsUpdate = true;
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// SKY GEOMETRY (big inverted sphere so camera inside)
const skyGeo = new THREE.SphereGeometry(50, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, // face inward
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;
    void main() {
      float height = normalize(vWorldPosition).y;
      
      // Gradient colors
      vec3 topColor = vec3(0.0, 0.0, 0.05);  // space black
      vec3 bottomColor = vec3(0.02, 0.05, 0.2);  // deep blue horizon
      
      vec3 color = mix(bottomColor, topColor, smoothstep(-0.2, 0.8, height));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);



/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
scene.add(camera);

// Function to set camera position based on screen size
const setCameraPosition = () => {
  if (window.innerWidth < 768) {
    camera.position.set(0, 1.5, 3); // Mobile - further back
  } else {
    camera.position.set(0, 1, 1.5); // Desktop - closer
  }
  camera.lookAt(new THREE.Vector3(0, 0, 0));
};

// Initial camera setup
setCameraPosition();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Helpers + Stats
 */
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

const stats = new Stats();
document.body.appendChild(stats.dom);

/**
 * Resize
 */
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update camera pos if needed
  setCameraPosition();
});

/**
 * Fullscreen toggle
 */
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// room enviroment

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnv = new RoomEnvironment();
const envMap = pmremGenerator.fromScene(roomEnv).texture;
envMap.mapping = THREE.EquirectangularReflectionMapping;
envMap.encoding = THREE.sRGBEncoding;
scene.environment = envMap;
// scene.background = envMap; // optional: shows it as bg



/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();

  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  controls.update();
  renderer.render(scene, camera);

  const tick = () => {
    stats.begin();
  
    const elapsedTime = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsedTime;
  
    // Update controls + stars
    controls.update();
    stars.rotation.y += 0.001;
  
    renderer.render(scene, camera);
    stats.end();
  
    requestAnimationFrame(tick);
  };
  

  stats.end();
  // console.log(`Camera position: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`);

  requestAnimationFrame(tick);
};

tick();
