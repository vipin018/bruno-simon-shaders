import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from '/shaders/vertex.glsl'
import fragmentShader from '/shaders/fragment.glsl'
/**
 * Base
 */
// Debug
const gui = new GUI()



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color("#E8D6C2")
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load("/textures/img.webp")
/**
 * Test mesh
 */
// Geometry
const geometry =  new THREE.PlaneGeometry(2,2, 128,128)
geometry.scale(1.5, 1, 1);

const count = geometry.attributes.position.count;
console.log(count);

const random = new Float32Array(count);

for (let i = 0; i < count; i++) {
    random[i] = Math.random();
}
geometry.setAttribute(
    'aRandom',
    new THREE.BufferAttribute(random, 1)
);



// Material
const material = new THREE.ShaderMaterial(
    {
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        // wireframe: true, ,
        side : THREE.DoubleSide,
        uniforms:{
            uFreq:{
                value: new THREE.Vector2(3, 2)
            },
            uTime: {
                value: 0
            },
            uTexture:{
                value: texture
            }
        }
    }
)

    gui.add(material.uniforms.uFreq.value, "x").min(0).max(20).step(0.01).name("Frequency X")
    gui.add(material.uniforms.uFreq.value, "y").min(0).max(20).step(0.01).name("Frequency Y")


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

window.addEventListener('resize', () => {
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
camera.position.set(0.25, - 0.25, 2)
scene.add(camera)

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

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Update material uniforms
    material.uniforms.uTime.value = elapsedTime
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()