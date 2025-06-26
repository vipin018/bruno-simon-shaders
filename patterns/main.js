import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui';
import VertexShader from './shaders/vertex.glsl'
import FragmentShader from './shaders/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('#canvas')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#0a001f')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1.5,1, 128, 128)

// Material
const material = new THREE.ShaderMaterial({
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
  side: THREE.DoubleSide,
  // wireframe: true,
  uniforms: {
    uTime: { value: 0 },
    uFrequency: { value: new THREE.Vector2(4.0, 10.0) },
  }
});

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(10).step(0.01).name('Frequency X');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(10).step(0.01).name('Frequency Y');


// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

scene.add(camera)
if (window.innerWidth < 768) {
  camera.position.set(0, 0, 2.5);
} else {
  camera.position.set(0.25, -0.25, 1.5);
}
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
  const elapsedTime = clock.getElapsedTime();

  // mesh.rotation.y += 0.02;

  // Update controls just in case (if using OrbitControls)
  controls.update();

  // Update time uniform
  material.uniforms.uTime.value = elapsedTime;

renderer.render(scene, camera)

  requestAnimationFrame(tick);
}

tick()