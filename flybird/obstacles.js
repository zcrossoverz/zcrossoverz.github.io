const obstacleArray = [];

class Obstacle{
    constructor(){
        this.top = (Math.random()*canvas.height/3) + 30;
        this.bottom = (Math.random()*canvas.height/3) + 30;
        this.x = canvas.width;
        this.width = 30;
        this.color = 'hsla('+color_particles+', 100%, 40%, 1)';
        this.count = false;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, 0, this.width, this.top);
        ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
    }
    update(){
        this.x -= gamespeed;
        if(!this.count && this.x < bird.x){
            score++;
            this.count = true;
        }
        if(score > 20){
            gamespeed = 1 + Math.floor(score/10);
        }
        this.draw();
    }
    reset(){
        this.top = (Math.random()*canvas.height/3) + 30;
        this.bottom = (Math.random()*canvas.height/3) + 30;
        this.x = canvas.width;
        this.width = 30;
        this.color = 'hsla('+color_particles+', 100%, 40%, 1)';
        this.count = false;
    }
}
function handleObstacle(){
    if(frame % 50 == 0){
        obstacleArray.unshift(new Obstacle);
    }
    for(let i = 0; i < obstacleArray.length; i++){
        obstacleArray[i].update();
    }
    if(obstacleArray.length > 20){
        obstacleArray.pop(obstacleArray[0]);
    }
}