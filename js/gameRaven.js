/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;


let timeToNextRaven = 0;
let ravenInterval = 1600;
let lastTime = 0;
let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

let ravens = [];
class Raven{
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 2 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'images/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 70 + 70;
        //color collision couleur sert de password unique
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        //conditionnal expression true or false
        this.hasTrail = Math.random() > 0.5 

    }
    update(deltaTime){
        if (this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y -= this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;

        if (this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail){
                //les ravens vont plus vite si ils ont hasTrail
                this.x -= 10;
                for (let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        //console.log(deltaTime);
        if(this.x < 0 - this.width) gameOver = true;
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'audio/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;


    }
    update(deltaTime){
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame ++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size )
    }
}

let particles = [];
class Particle {
    constructor (x, y, size, color){
        //on place size en premier pour l'utiliser sur x et y pour pouvoir centrer sur raven
        this.size = size;
        this.x = x + this.size*0.5 + Math.random() * 50 - 25;
        this.y = y + this.size*0.33 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size*0.1;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
        // -5 pour eviter le clignotement lorsque radius > max radius on declenche plut tot
    }
    draw(){
        ctx.save(); //pour que le corbeau ne clignote pas, opacite n'agit que sur particule
        ctx.globalAlpha = 1 - this.radius/this.maxRadius; //opacite de 0 a 1
        ctx.beginPath();  //start the drawing
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);  //draw circle 0 = start angle  Math.PI * 2 end angle
        ctx.fill(); 
        ctx.restore();  
    }
}

function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80);
}

function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 +5);
}

window.addEventListener('click', function(e) {
    //console.log(e.x, e.y); scan area 1 sur 1 pixel
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2] ){
            //collision detected
            object.markedForDeletion = true;
            score++;
            if (object.hasTrail){
                score += 9;    
            } 
            explosions.push(new Explosion(object.x, object.y, object.width));
            //console.log(explosions);
        }
    });
});

//const raven = new Raven(); verification avec 1 seul element

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    let deltaTime =timestamp - lastTime;
    lastTime = timestamp;
    //console.log(timestamp);
    timeToNextRaven += deltaTime;
    //console.log(deltaTime); periodique event
    if (timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width;
        });
        //console.log(ravens);
    };
    //console.log(timestamp); probleme la premiere valeur est undefined
    // raven.update();
    // raven.draw();

    drawScore();

    //array literal []  ... spread operator  particul class expense pour ajouter explosions array attention ordre particles derriere ravens derriere explosions
    [...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [...particles,  ...ravens, ...explosions].forEach(object => object.draw());

    //on crée un nouveau tableau filtré sur markedForDeletion = false
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    //console.log(ravens);
    
    if(!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}

//pour regler le probleme timestamp undefined, on defini une valeur de départ de 0
animate(0)