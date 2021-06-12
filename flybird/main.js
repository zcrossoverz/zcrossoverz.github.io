const canvas = document.getElementById("cv1");
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;

let spacePress = false;
let temp = canvas.height - 60;
let angle = 0.1;
let gamespeed = 2;
let color_particles = 0;
let frame = 0;
let score = 0;

const background = new Image();
background.src = 'bg1.jpg';
const bg = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height
}
function handleBackground(){
    if(bg.x1 <= -bg.width + gamespeed) bg.x1 = bg.width;
    else bg.x1 -= gamespeed;
    if(bg.x2 <= -bg.width + gamespeed) bg.x2 = bg.width;
    else bg.x2 -= gamespeed;
    ctx.drawImage(background,bg.x1, bg.y, bg.width, bg.height);
    ctx.drawImage(background,bg.x2, bg.y, bg.width, bg.height);
}


function animate(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.height);
    handleBackground();
    bird.update();
    bird.draw();  
    handleObstacle();
    ctx.fillStyle = 'white';
    ctx.font = '15px cursive';
    ctx.fillText('Level: '+(gamespeed-1)+' Điểm: '+score, 400, 30);
    handleParticles();
    handleCollision();
    if(handleCollision()) return;
    requestAnimationFrame(animate);
    angle+= 0.12;
    color_particles++;
    frame++;
}
animate();
window.addEventListener('keydown', function(e){
    if(e.keyCode == 32) spacePress = true;
});
window.addEventListener('keyup',function(e){
    if(e.keyCode == 32){
        spacePress = false;
        bird.frame = 0;
    }
    if(e.keyCode == 70){
        location.reload();
    }
});

const explosion = new Image();
explosion.src = 'bang.png';
function handleCollision(){
    let i = Math.floor(score/10);
    let message = ['ngu vãi lồn, bạn như thiểu năng chơi game','được '+score+' điểm, đỡ hơn chút nhưng vẫn ngu!','được '+score+' cũng tạm đấy','được '+score+' điểm, bạn chơi cũng không tệ','good job ờ mây ding, '+score+' điểm','kỷ luc thế giới '+score+' điểm','hay vãi cặc '+score+' điểm','bạn đạt kỷ lục thế giới con mẹ nó rồi'];
    if(i>=message.length) {
        let msg = message[message.length - 1];
    }else{
        msg = message[i];
    }
    for(let i = 0; i < obstacleArray.length; i++){
        if(bird.x < obstacleArray[i].x + obstacleArray[i].width && bird.x + bird.width > obstacleArray[i].x && ((bird.y < 0 + obstacleArray[i].top && bird.y + bird.height > 0) || (bird.y > canvas.height - obstacleArray[i].bottom && bird.y + bird.height < canvas.height))){
            ctx.drawImage(explosion, bird.x-10, bird.y-25, 50, 50);
            ctx.font = '20px Comic Sans MS';
            ctx.fillStyle = 'white';
            ctx.fillText(msg,100,canvas.height/2 - 10);
            ctx.fillText("Nhấn f để chơi lại", 160, canvas.height/2 + 15);
            return true;
        }
    }
}


