const THREE = require('three')
import { EffectComposer, RenderPass, GlitchPass } from "postprocessing"

let camera, scene, renderer, composer
let object, light

let glitchPass, cube

init()
animate()

function init() {
  const w = window.innerWidth
  const h = window.innerHeight

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)
  document.body.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(70, w / h, 1, 1000)
  camera.position.z = 400

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 1, 1000)

  // object = new THREE.Object3D()

  let geometry = new THREE.BoxGeometry(h / 2, h / 4, 100 )
  let emoji = new THREE.TextureLoader().load("./poop.png")

  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: emoji
  })

  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  scene.add(new THREE.AmbientLight(0x222222))

  light = new THREE.DirectionalLight(0xffffff)
  light.position.set(1, 1, 1)
  scene.add(light)

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  glitchPass = new GlitchPass()
  glitchPass.renderToScreen = true
  composer.addPass(glitchPass)

  window.addEventListener("resize", onWindowResize, false)
}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setSize(w, h)
  composer.setSize(w, h)
}

function animate() {
  requestAnimationFrame(animate)

  let time = Date.now()

  composer.render()
}
