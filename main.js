const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 81, window.innerWidth / window.innerHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0xffffff )
scene.add( light )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )

camera.position.z = 5
renderer.setClearColor( 0xFFC0CB, 1 )
const bgTexture = new THREE.TextureLoader().load("./img/squid-game-bg.jpg");
scene.background = bgTexture;



const loader = new THREE.GLTFLoader()
let doll

const start_position = 6
const end_position = -start_position

const text = document.querySelector('.text')

let DEAD_PLAYERS = 0
let SAFE_PLAYERS = 0

const startBtn = document.querySelector('.start-btn')

//all musics
const bgMusic = new Audio('./music/bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('./music/win.mp3')
const loseMusic = new Audio('./music/lose.mp3')

loader.load( './model/scene.gltf', function ( gltf ){
    scene.add( gltf.scene )
    doll = gltf.scene
    gltf.scene.position.set(-8.5,0, -1)
    gltf.scene.scale.set(0.4, 0.4, 0.4)
    startBtn.innerText = "start"
})
let gameEnded = false;

function lookBackward(){
    if (gameEnded) return; 
    gsap.to(doll.rotation, {duration: .25, y: 4.15})
    setTimeout(() => dallFacingBack = true, 150)
}
function lookForward(){
    if (gameEnded) return; 
    gsap.to(doll.rotation, {duration: .25, y: -4.25})
    setTimeout(() => dallFacingBack = false, 450)
}

function createCube(size, posX, rotY = 0, color = 0xE41B17){
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d )
    const material = new THREE.MeshBasicMaterial( { color } )
    const cube = new THREE.Mesh( geometry, material )
    cube.position.set(posX, 0, 0)
    cube.rotation.y = rotY
    scene.add( cube )
    return cube
}

  
//Design of staring and ending position

createCube({w: .2, h: 1.5, d: 1}, start_position, -.4)
createCube({w: .2, h: 1.5, d: 1}, end_position, .4)
//createCube({w: .2, h: 2, d: 1}, end_position, -.50)
class Player {
    constructor(name = "Player", posY = 1) {
        this.playerInfo = {
            positionX: start_position - 0.4,
            velocity: 0,
            name,
            isDead: false
        };
        this.playerPromise = new Promise((resolve) => {
        const loader = new THREE.GLTFLoader();

        loader.load('./squid_game_people/scene.gltf', (gltf) => {
            this.player= gltf.scene;
            this.player.position.set(-9.5, 0, -1);
            this.player.scale.set(1.2, 1.2, 1.2); // Adjust the scale of the model
            this.player.position.x = start_position  -1.5;
            this.player.position.z = .1;
 
            this.player.position.y = -3 * posY;
            this.player.rotation.y=-1.5;
            scene.add(this.player);
            resolve()
           
        });
           
        });

        
    }


    run(){
        if(this.playerInfo.isDead) return
        this.playerInfo.velocity = .02
    }

    stop(){
        gsap.to(this.playerInfo, { duration: .1, velocity: 0 })
    }

    check(){
        if(this.playerInfo.isDead) return
        if(!dallFacingBack && this.playerInfo.velocity > 0){
            text.innerText = this.playerInfo.name + " lost!!!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            loseMusic.play()
            if(DEAD_PLAYERS == players.length){
                text.innerText = "Nobody clinched victory!!!"
                gameStat = "ended"
                gameEnded = true;
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
                gameEnded = true;
            }
        }
        if(this.playerInfo.positionX < end_position + .7){
            text.innerText = this.playerInfo.name + " is secure!!!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            winMusic.play()
            if(SAFE_PLAYERS == players.length){
                text.innerText = "The safety of all individuals is confirmed.!!!"
                gameStat = "ended"
                gameEnded = true;
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
                gameEnded = true;
            }
        }
    }
    update() {
        // Wait for the player loading to complete before updating
        this.playerPromise.then(() => {
            this.check();
            this.playerInfo.positionX -= this.playerInfo.velocity;

            // Ensure the player object is defined before accessing its properties
            if (this.player) {
                this.player.position.x = this.playerInfo.positionX;
            }
        });
    }

   
}

async function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

const player1 = new Player("Player 1", .29)
const player2 = new Player("Player 2", .29)

const players = [
    {
        player: player1,
        key: "ArrowUp",
        name: "Player 1"
    },
    {
        player: player2,
        key: "ArrowDown",
        name: "Player 2"
    }
]

const TIME_LIMIT = 25
async function init(){
    await delay(500)
    text.innerText = "Launching after a brief countdown 3"
    await delay(500)
    text.innerText = "countdown 2"
    await delay(500)
    text.innerText = "countdown 1"
    lookBackward()
    await delay(500)
    text.innerText = "Keep Going!!!"
    bgMusic.play()
    start()
}

let gameStat = "loading"

function start(){
    gameStat = "started"
    const progressBar = createCube({w: 8, h: .1, d: 1}, 0, 0, 0xebaa12)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"})
    setTimeout(() => {
        if(gameStat != "ended"){
            text.innerText = "Time Out!!!"
            loseMusic.play()
            gameStat = "ended"
            gameEnded = true;
        }
    }, TIME_LIMIT * 1000)
    startDall()
}

let dallFacingBack = true
async function startDall(){
   lookBackward()
   await delay((Math.random() * 1500) + 1500)
   lookForward()
   await delay((Math.random() * 750) + 750)
   startDall()
}


startBtn.addEventListener('click', () => {
    if(startBtn.innerText == "START"){
        init()
        document.querySelector('.modal').style.display = "none"
    }
})

function animate(){
    requestAnimationFrame(animate);
    
    renderer.render( scene, camera )
   
    players.forEach(playerObj => {
        playerObj.player.update();
    });
  
    if(gameStat == "ended") return
    
    
}
animate()

window.addEventListener( "keydown", function(e){
    if(gameStat != "started") return
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})
window.addEventListener( "keyup", function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})

window.addEventListener( 'resize', onWindowResize, false )
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}