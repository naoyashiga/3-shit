const THREE = require('three')

export default class PointCloud {
  constructor(maxParticleCount) {

    this.positions = new Float32Array(maxParticleCount * 3)
    this.particles = new THREE.BufferGeometry()

    this.material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    })

    this.cloud = new THREE.Points(this.particles, this.material)

  }

  setup() {
    const particleCount = 500
    this.particles.setDrawRange(0, particleCount)
    this.particles.addAttribute('position', new THREE.BufferAttribute(this.positions, 3).setDynamic(true))
  }
}
