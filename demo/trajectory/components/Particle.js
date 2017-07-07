const THREE = require('three')


export default class Particle {
  constructor() {
    this.radius = 800
    this.speed = 10 + Math.random() * 2

    this.location = new THREE.Vector3(
      this.radius / 2,
      this.radius / 2,
      this.radius / 2
      //  Math.random() * this.radius - this.radius / 2,
      //  Math.random() * this.radius - this.radius / 2,
      //  Math.random() * this.radius - this.radius / 2
    )

    this.velocity = new THREE.Vector3(this.speed, 0, 0)
    // this.velocity = new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 )

    this.numConnections = 0

  }

  update() {
    this.location.add(this.velocity)
  }

  borders() {
    const rHalf = this.radius / 2

    if (this.location.x > rHalf && this.velocity.x != 0) {
      this.velocity.x = 0
      this.velocity.y = -this.speed

      this.location.x = rHalf
    }

    if (this.location.y < -rHalf && this.velocity.y != 0) {
      this.velocity.y = 0
      this.velocity.x = -this.speed

      this.location.y = -rHalf
    }

    if (this.location.x < -rHalf && this.velocity.x != 0) {
      this.velocity.x = 0
      this.velocity.y = this.speed

      this.location.x = -rHalf
    }

    if (this.location.y > rHalf && this.velocity.y != 0) {
      this.velocity.y = 0
      this.velocity.x = this.speed

      this.location.y = rHalf
    }

  }
}
