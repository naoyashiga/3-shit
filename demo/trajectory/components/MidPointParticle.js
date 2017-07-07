const THREE = require('three')


export default class MidPointParticle {
  constructor(p, q) {
    const l1 = new THREE.Vector3().copy(p)
    const l2 = new THREE.Vector3().copy(q)

    this.location = l1.add(l2).divideScalar(2.0)
    this.location.z = p.z

  }

  update(p, q) {
    const l1 = new THREE.Vector3().copy(p)
    const l2 = new THREE.Vector3().copy(q)

    this.location = l1.add(l2).divideScalar(2.0)
    this.location.z = p.z
  }

  borders() {
    // const rHalf = this.radius / 2
  }
}
