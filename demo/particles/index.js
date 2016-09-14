const THREE = require('three')

import Stats from 'stats.js'
import dat from 'dat-gui'

import Particle from './components/Particle'
import PointCloud from './components/PointCloud'
import Line from './components/Line'

const OrbitControls = require('three-orbit-controls')(THREE)


class Viz {
  constructor() {
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.particleCount = 500
    this.maxParticleCount = 1000
    this.particles = []
    this.r = 800

    this.group = new THREE.Group()

    this.effectController = {
      showDots: true,
      showLines: true,
      minDistance: 150,
      limitConnections: false,
      maxConnections: 20,
      particleCount: 500
    }

    this.initGUI()

    this.camera = new THREE.PerspectiveCamera( 45, this.w / this.h, 1, 4000 )
    this.camera.position.z = 1750;

    this.controls = new OrbitControls(this.camera, document.body)

    const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(this.r, this.r, this.r)))
    helper.material.color.setHex(0x080808)
    helper.material.blending = THREE.AdditiveBlending
    helper.material.transparent = true
    this.group.add(helper)

    this.scene = new THREE.Scene()


    this.scene.add(this.group)

    this.pointCloud = new PointCloud(this.maxParticleCount)

    for (let i = 0; i < this.maxParticleCount; i++) {
      const p = new Particle()

      this.pointCloud.positions[i * 3] = p.location.x
      this.pointCloud.positions[i * 3 + 1] = p.location.y
      this.pointCloud.positions[i * 3 + 2] = p.location.z

      this.particles.push(p)
    }

    this.pointCloud.setup()
    this.group.add(this.pointCloud.cloud)

    this.line = new Line(this.maxParticleCount)
    this.group.add(this.line.mesh)

    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.w, this.h)

    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true

    document.body.appendChild(this.renderer.domElement)

    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)

    window.addEventListener('resize', this.onWindowResize, false)

  }

  initGUI() {

    const gui = new dat.GUI()

    gui.add(this.effectController, "showDots").onChange(function( value ) { this.pointCloud.visible = value; })
    gui.add(this.effectController, "showLines" ).onChange( function( value ) { this.line.mesh.visible = value; })
    gui.add(this.effectController, "minDistance", 10, 300 )
    gui.add(this.effectController, "limitConnections" )
    gui.add(this.effectController, "maxConnections", 0, 30, 1 )
    gui.add(this.effectController, "particleCount", 0, this.maxParticleCount, 1 ).onChange( function( value ) {

      this.particleCount = parseInt(value)
      pointCloud.particles.setDrawRange( 0, this.particleCount )

    })

  }

  onWindowResize() {

    this.camera.aspect = this.w / this.h
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.w, this.h)

  }

  animate() {

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    this.particles.forEach((p) => {
      p.numConnections = 0
    })

    for(let i = 0; i < this.particleCount; i++) {

      const p = this.particles[i]

      p.update()

      this.pointCloud.positions[i * 3] = p.location.x
      this.pointCloud.positions[i * 3 + 1] = p.location.y
      this.pointCloud.positions[i * 3 + 2] = p.location.z

      p.borders()

      if (this.effectController.limitConnections && p.numConnections >= this.effectController.maxConnections ) {
        continue
      }

      for (let j = i + 1; j < this.particleCount; j++ ) {

        const q = this.particles[j]

        if (this.effectController.limitConnections && q.numConnections >= this.effectController.maxConnections) {
          continue
        }

        const dist = p.location.distanceTo(q.location)

        if (dist < this.effectController.minDistance) {

          p.numConnections++
          q.numConnections++

          let alpha = 1.0 - dist / this.effectController.minDistance

          this.line.update(vertexpos, colorpos, alpha, p, q, i, j)

          vertexpos += 6
          colorpos += 6

          numConnected++
        }
      }
    }


    this.line.mesh.geometry.setDrawRange(0, numConnected * 2)
    this.line.mesh.geometry.attributes.position.needsUpdate = true
    this.line.mesh.geometry.attributes.color.needsUpdate = true

    this.pointCloud.cloud.geometry.attributes.position.needsUpdate = true

    requestAnimationFrame(this.animate.bind(this))

    this.stats.update()
    this.render()

  }

  render() {
    const time = Date.now() * 0.001

    this.group.rotation.y = time * 0.1
    this.renderer.render(this.scene, this.camera)
  }
}

let viz = new Viz()

viz.animate()
