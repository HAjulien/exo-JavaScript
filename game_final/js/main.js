import Player from './player.js';
import {InputHandler} from './input.js';

window.addEventListener('load', function(){

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            //create automatically a instance of player and InputHandler (import) when i create an instance of game + i need game as argument for new Player so i pass with keyword THIS (refer to game object)
            this.player = new Player(this);
            this.input = new InputHandler();
        }
        update(deltaTime) {
            this.player.update(this.input.keys, deltaTime);
        }
        draw(context) {
            this.player.draw(context)
        } 
    }

    const game = new Game(canvas.width, canvas.height)
    console.log(game);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        //console.log(deltaTime);
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0)
});