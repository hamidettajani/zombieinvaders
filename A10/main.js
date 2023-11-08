const poeng = document.querySelector('#poeng')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
// canvas.width = 1024
// canvas.height = 576

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/spaceship.png'
        image.onload = () => {
            const scale = 0.15
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }

    }
    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width,
        // this.height)
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
    }
    update() {
        if (this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}
class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, 
            Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class ZombieProjectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.width = 5
        this.height = 10
    }
    draw() {
        c.fillStyle = '#659237'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Zombie {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 0
        }
        const image = new Image()
        image.src = './img/zombie.png'
        image.onload = () => {
            const scale = 0.09
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }

    }
    draw() {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            )
    }
    update({velocity}) {
        if (this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    shoot(zombieProjectiles) {
        zombieProjectiles.push(new ZombieProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }))
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }

        this.zombies = []
        const columns = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 4 + 1)

        this.width = columns * 30

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
            this.zombies.push(
                new Zombie({
                    position: {
                        x: x * 30,
                        y: y * 60
                    }
                })     
            )
        }
    }
        console.log(this.zombies)
    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        } 
    }
}

const player = new Player()
const projectiles = []
const grids = []
const zombieProjectiles = []

const keys = {
     ArrowLeft: {
        pressed: false
    },
      ArrowRight: {
        pressed: false
    },
     ArrowUp: {
        pressed: false
    }
}


let score = 0
let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)


function animate() {

    requestAnimationFrame(animate)
    c.fillStyle = '#1d170f'
    c.fillRect(0,0, canvas.width, canvas.height)
    player.update()
    zombieProjectiles.forEach((zombieProjectiles) => {
        zombieProjectiles.update()
        if (
        zombieProjectiles.position.y + zombieProjectiles.
        height >= player.position.y && zombieProjectiles.position.x +
        zombieProjectiles.width >= player.position.x &&
        zombieProjectiles.position.x <= player.position.x + player.width) {
            console.log('you lose')
        }
    })
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })

    grids.forEach(grid => {
        grid.update()

        //spawn projectiles
        if (frames % 100 === 0 && grid.zombies.length > 0) {
            grid.zombies[Math.floor(Math.random() * grid.zombies.
            length)].shoot(
            zombieProjectiles
            )

        }

        grid.zombies.forEach((zombie, i) => {
            zombie.update({velocity: grid.velocity})

            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <= 
                    zombie.position.y + zombie.height && 
                    projectile.position.x + projectile.radius >= 
                    zombie.position.x && 
                    projectile.position.x - projectile.radius <= 
                    zombie.position.x + zombie.width && projectile.position.y +
                    projectile.radius >= zombie.position.y
                    ) {
                        setTimeout(() => {
                            const zombiefound = grid.zombies.find(
                                (zombie2) => zombie2 === zombie)
                            const projectilefound = projectiles.find(
                                (projectile2) => projectile2 === projectile)
                    
                            // fjerner zombies og projectiles
                            if (zombiefound && projectilefound) {
                                score += 100
                                poeng.innerHTML = score


                                grid.zombies.splice(i, 1)
                                projectiles.splice(j,1)

                                if (grid.zombies.length > 0) {
                                    const firstZombie = grid.zombies[0]
                                    const lastZombie = grid.zombies[grid.zombies.length - 1]

                                    grid.width = lastZombie.position.x - firstZombie.position.x + lastZombie.width
                                }
                            }
                        }, 0)
                    }
            })
        })
    })

    if (keys.ArrowLeft.pressed && player.position.x >= 0){
        player.velocity.x = -5
    } else if (keys.ArrowRight.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5
    } else {
        player.velocity.x = 0
    }
    // spawner flere zombier
    if (frames % randomInterval === 0)  {
        grids.push(new Grid())
    }

    frames++
}

animate()

addEventListener('keydown', ({ key }) => {
    // if (game.over) return

    switch (key) {
        case 'ArrowLeft':
            // console.log('left')
            player.velocity.x = -5
            keys. ArrowLeft.pressed = true
            break
        case 'ArrowRight':
            // console.log('right')
            keys.  ArrowRight.pressed = true
            break
        case ' ':
            // console.log('ArrowUp')
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    velocity: {
                        x: 0,
                        y: -10
                    }
                })
            )

            // console.log(projectiles)
            break 
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'ArrowLeft':
            // console.log('left')
            player.velocity.x = -5
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowRight':
            // console.log('right')
            keys.ArrowRight.pressed = false
            break
        case ' ':
            // console.log('ArrowUp')
            keys.ArrowUp.pressed = true
            break 
    }
})