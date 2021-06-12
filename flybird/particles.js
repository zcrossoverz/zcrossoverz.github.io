const particlesArray = [];

class Particle{
    constructor(){
        this.x = bird.x;
        this.y = bird.y;
        this.size = Math.random()*7 + 3;
        this.speedY = (Math.random() * 1) - 0.5;
        this.color = 'hsla('+color_particles+', 100%, 55%, 0.4)';
    }
    update(){
        this.x -= gamespeed;
        this.y += this.speedY;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + 15, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles(){
    particlesArray.unshift(new Particle);
    for(let i = 0; i<particlesArray.length; i++){
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    if(particlesArray.length > 200){
        for(let i = 0; i < 20; i++){
            particlesArray.pop(particlesArray[i]);
        }
    }
}