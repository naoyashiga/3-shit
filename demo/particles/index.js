const THREE = require('three')

import Stats from 'stats.js'
import dat from 'dat-gui'

import Particle from './components/Particle'
import PointCloud from './components/PointCloud'
import Line from './components/Line'

let OrbitControls = require('three-orbit-controls')(THREE)

let group
let controls, stats
let particles = []
let camera, scene, renderer
let positions, colors
let pointCloud

let line

let maxParticleCount = 1000
let particleCount = 500
let r = 800
let rHalf = r / 2

let effectController = {
  showDots: true,
  showLines: true,
  minDistance: 150,
  limitConnections: false,
  maxConnections: 20,
  particleCount: 500
}

init()
animate()

function initGUI() {

  const gui = new dat.GUI()

  gui.add( effectController, "showDots" ).onChange( function( value ) { pointCloud.visible = value; })
  gui.add( effectController, "showLines" ).onChange( function( value ) { line.mesh.visible = value; })
  gui.add( effectController, "minDistance", 10, 300 )
  gui.add( effectController, "limitConnections" )
  gui.add( effectController, "maxConnections", 0, 30, 1 )
  gui.add( effectController, "particleCount", 0, maxParticleCount, 1 ).onChange( function( value ) {

    particleCount = parseInt(value)
    pointCloud.particles.setDrawRange( 0, particleCount )

  })

}

function init() {
  const w = window.innerWidth
  const h = window.innerHeight

  initGUI()

  camera = new THREE.PerspectiveCamera( 45, w / h, 1, 4000 )
  camera.position.z = 1750;

  controls = new OrbitControls(camera, document.body)

  scene = new THREE.Scene()

  group = new THREE.Group()
  scene.add(group)

  const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r, r, r)))
  helper.material.color.setHex(0x080808)
  helper.material.blending = THREE.AdditiveBlending
  helper.material.transparent = true
  group.add(helper)

  // const segments = maxParticleCount * maxParticleCount
  //
  // positions = new Float32Array(segments * 3)
  // colors = new Float32Array(segments * 3)

  pointCloud = new PointCloud(maxParticleCount)

  for (let i = 0; i < maxParticleCount; i++) {
    const p = new Particle()

    pointCloud.positions[i * 3] = p.location.x
    pointCloud.positions[i * 3 + 1] = p.location.y
    pointCloud.positions[i * 3 + 2] = p.location.z

    particles.push(p)
  }

  pointCloud.setup()
  group.add(pointCloud.cloud)

  // let geometry = new THREE.BufferGeometry()
  //
  // geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true))
  // geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true))
  //
  // geometry.computeBoundingSphere()
  //
  // geometry.setDrawRange(0, 0)
  //
  // const material = new THREE.LineBasicMaterial({
  //   vertexColors: THREE.VertexColors,
  //   blending: THREE.AdditiveBlending,
  //   transparent: true
  // })
  //
  // line.mesh = new THREE.LineSegments(geometry, material)
  line = new Line(maxParticleCount)
  group.add(line.mesh)

  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)

  renderer.gammaInput = true
  renderer.gammaOutput = true

  document.body.appendChild(renderer.domElement)

  stats = new Stats()
  document.body.appendChild(stats.dom)

  window.addEventListener('resize', onWindowResize, false)

}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setSize(w, h)

}

function animate() {

  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  particles.forEach((p) => {
    p.numConnections = 0
  })

  for(let i = 0; i < particleCount; i++) {

    const p = particles[i];

    p.update()

    pointCloud.positions[ i * 3     ] = p.location.x
    pointCloud.positions[ i * 3 + 1 ] = p.location.y
    pointCloud.positions[ i * 3 + 2 ] = p.location.z

    p.borders()

    if ( effectController.limitConnections && p.numConnections >= effectController.maxConnections )
    continue;

    for (let j = i + 1; j < particleCount; j++ ) {

      const q = particles[j]

      if ( effectController.limitConnections && q.numConnections >= effectController.maxConnections ) {
        continue
      }

      const dist = p.location.distanceTo(q.location)

      if (dist < effectController.minDistance) {

        p.numConnections++
        q.numConnections++

        let alpha = 1.0 - dist / effectController.minDistance

        line.update(vertexpos, colorpos, alpha, p, q, i, j)

        vertexpos += 6
        colorpos += 6

        numConnected++
      }
    }
  }


  line.mesh.geometry.setDrawRange(0, numConnected * 2)
  line.mesh.geometry.attributes.position.needsUpdate = true
  line.mesh.geometry.attributes.color.needsUpdate = true

  pointCloud.cloud.geometry.attributes.position.needsUpdate = true

  requestAnimationFrame(animate)

  stats.update()
  render()

}

function render() {

  const time = Date.now() * 0.001

  group.rotation.y = time * 0.1
  renderer.render(scene, camera)
}
