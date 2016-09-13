const THREE = require('three')

import Stats from 'stats.js'
import dat from 'dat-gui'

let OrbitControls = require('three-orbit-controls')(THREE)

let group
let controls, stats
let particlesData = []
let camera, scene, renderer
let positions, colors
let particles
let pointCloud
let particlePositions
let linesMesh

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
};

init()
animate()

function initGUI() {

  const gui = new dat.GUI()

  gui.add( effectController, "showDots" ).onChange( function( value ) { pointCloud.visible = value; })
  gui.add( effectController, "showLines" ).onChange( function( value ) { linesMesh.visible = value; })
  gui.add( effectController, "minDistance", 10, 300 )
  gui.add( effectController, "limitConnections" )
  gui.add( effectController, "maxConnections", 0, 30, 1 )
  gui.add( effectController, "particleCount", 0, maxParticleCount, 1 ).onChange( function( value ) {

    particleCount = parseInt(value)
    particles.setDrawRange( 0, particleCount )

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

  const segments = maxParticleCount * maxParticleCount

  positions = new Float32Array(segments * 3)
  colors = new Float32Array(segments * 3)

  const pMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 3,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: false
  })

  particles = new THREE.BufferGeometry()
  particlePositions = new Float32Array(maxParticleCount * 3)

  for (let i = 0; i < maxParticleCount; i++) {

    let x = Math.random() * r - r / 2
    let y = Math.random() * r - r / 2
    let z = Math.random() * r - r / 2

    particlePositions[ i * 3     ] = x
    particlePositions[ i * 3 + 1 ] = y
    particlePositions[ i * 3 + 2 ] = z

    particlesData.push({
      velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
      numConnections: 0
    })
  }

  particles.setDrawRange(0, particleCount)
  particles.addAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true))

  // create the particle system
  pointCloud = new THREE.Points(particles, pMaterial)
  group.add(pointCloud)

  let geometry = new THREE.BufferGeometry()

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true))
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3).setDynamic(true))

  geometry.computeBoundingSphere()

  geometry.setDrawRange(0, 0)

  const material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    blending: THREE.AdditiveBlending,
    transparent: true
  })

  linesMesh = new THREE.LineSegments(geometry, material)
  group.add(linesMesh)

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

  for(let i = 0; i < particleCount; i++) {
    particlesData[ i ].numConnections = 0;
  }

  for(let i = 0; i < particleCount; i++) {

    let particleData = particlesData[i];

    particlePositions[ i * 3     ] += particleData.velocity.x;
    particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
    particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

    if ( particlePositions[ i * 3 + 1 ] < -rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
    particleData.velocity.y = -particleData.velocity.y;

    if ( particlePositions[ i * 3 ] < -rHalf || particlePositions[ i * 3 ] > rHalf )
    particleData.velocity.x = -particleData.velocity.x;

    if ( particlePositions[ i * 3 + 2 ] < -rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
    particleData.velocity.z = -particleData.velocity.z;

    if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
    continue;

    for ( let j = i + 1; j < particleCount; j++ ) {

      let particleDataB = particlesData[ j ]
      if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
      continue

      let dx = particlePositions[ i * 3     ] - particlePositions[ j * 3     ]
      let dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ]
      let dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ]
      let dist = Math.sqrt( dx * dx + dy * dy + dz * dz )

      if (dist < effectController.minDistance) {

        particleData.numConnections++
        particleDataB.numConnections++

        let alpha = 1.0 - dist / effectController.minDistance

        positions[ vertexpos++ ] = particlePositions[ i * 3     ]
        positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ]
        positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ]

        positions[ vertexpos++ ] = particlePositions[ j * 3     ]
        positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ]
        positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ]

        colors[ colorpos++ ] = alpha
        colors[ colorpos++ ] = alpha
        colors[ colorpos++ ] = alpha

        colors[ colorpos++ ] = alpha
        colors[ colorpos++ ] = alpha
        colors[ colorpos++ ] = alpha

        numConnected++
      }
    }
  }


  linesMesh.geometry.setDrawRange(0, numConnected * 2)
  linesMesh.geometry.attributes.position.needsUpdate = true
  linesMesh.geometry.attributes.color.needsUpdate = true

  pointCloud.geometry.attributes.position.needsUpdate = true

  requestAnimationFrame(animate)

  stats.update()
  render()

}

function render() {

  const time = Date.now() * 0.001

  group.rotation.z = time * 0.1
  renderer.render(scene, camera)
}
