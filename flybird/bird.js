const birdsheet = new Image();
birdsheet.src = 'chimxanh.png';

class Bird{
    constructor(){
        this.x = 150;
        this.y = 200;
        this.vy = 0;
        this.originWidth = 719;
        this.originHeight = 612;
        this.height = this.originHeight/20;
        this.width = this.originWidth/20;
        this.weight = 1;
        this.frame = 0;
    }
    update(){
        let curve = Math.sin(angle) * 20;
        if(this.y > canvas.height - (this.height*3 + curve)){
            this.vy = 0;
            this.y = canvas.height - (this.height*3 + curve);
        }else{
            this.vy += this.weight; 
            this.vy *= 0.9; 
            this.y += this.vy;
        }
        if(this.y < this.height){
            this.vy = this.height;
              
        } 
        if(spacePress) this.flap();
        
    }
    flap(){
        this.vy -= 2;
        if(this.frame >= 3) this.frame = 0;
        else this.frame++;
    }
    draw(){
        // ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(birdsheet, this.frame*this.originWidth, 0, bird.originWidth, bird.originHeight, this.x - 8, this.y - 2, this.width*1.3, this.height*1.3);
    }
    reset(){
        this.x = 150;
        this.y = 200;
        this.vy = 0;
        this.originWidth = 719;
        this.originHeight = 612;
        this.height = this.originHeight/20;
        this.width = this.originWidth/20;
        this.weight = 1;
        this.frame = 0;
    }
}
const bird = new Bird();