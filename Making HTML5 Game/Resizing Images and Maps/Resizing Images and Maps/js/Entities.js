var player;
var enemyList={};
var upgradeList={};
var bulletList={};

Entity = function(type, id, x, y, spdX, spdY, width, height, img){

var self ={
type:type,
x:x,
spdX:spdX,
y:y,
spdY:spdY,
name:name, 
width:width,
height:height, 
img:img
};

self.update = function(){

self.updatePosition();
self.draw();

};

self.draw = function(){

ctx.save(); //save current settings
var x = self.x;
var y = self.y;
// ctx.drawImage(Image, cropImagestartx, cropImagestarty, cropImagewidth, cropImageheight, drawCanvasX, drawCanvasY, drawCanvasWidth, drawCanvasHeight);
ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
ctx.restore(); //restore or bring up

};

self.getDistanceBetween = function(entity2){ //return distance (number)

var vx = self.x - entity2.x; 
var vy = self.y - entity2.y;
return Math.sqrt(vx*vx+vy*vy);

};

self.testCollision = function(entity2){ //return if colliding (true/false)

var rect1 = {

x:self.x - self.width/4,
y:self.y - self.height/4,
width:self.width/4,
height:self.height/4

}

var rect2 = {

x:entity2.x - entity2.width/4,
y:entity2.y - entity2.height/4,
width:entity2.width/4,
height:entity2.height/4
}

return testCollisionRectRect(rect1, rect2);

};

self.updatePosition = function(){

self.x += self.spdX;
self.y += self.spdY;   


if(self.x <= 0 || self.x+self.width >= ctc.width){

self.spdX = -self.spdX;
}

if(self.y <= 0 || self.y+self.height >= ctc.height){

self.spdY = -self.spdY;
}

};


return self;

};

Actor = function(type, id, x, y, spdX, spdY, width, height,img, hp, atkSpd){

var self = Entity(type, id, x, y, spdX, spdY, width, height, img);

self.hp = hp;
self.atkSpd = atkSpd;
self.attackCounter = 0;
self.aimAngle = 0;

var super_update = self.update;

self.update = function(){

super_update();
self.attackCounter += self.atkSpd;

};

self.performAttack = function(){

if(self.attackCounter>25){ 

GenerateBullet(self);
self.attackCounter = 0;

}

};

self.performSpecialAttack = function(){

if(self.attackCounter>1){ 

GenerateBullet(self, self.aimAngle - 5);
GenerateBullet(self, self.aimAngle);
GenerateBullet(self, self.aimAngle + 5);

self.attackCounter = 0;

}


};

return self;

};



Player = function(){
var self = Actor('player', 'MyId', 50, 40, 30, 5, 50, 70, Img.player, 10, 1);

document.onclick = function(mouse){
self.performAttack();
};

document.oncontextmenu = function(mouse){ // on right click
self.performSpecialAttack();
mouse.preventDefault();
};


self.updatePosition = function(){

if(self.pressingRight){
self.x += 10;
}
if(self.pressingLeft){
self.x -= 10;
}
if(self.pressingDown){
self.y += 10;
}
if(self.pressingUp){
self.y -= 10;
}

 
//Limit area bound
if(self.x <= self.x/2){
self.x = self.x/2;
}
if(self.x > WIDTH-self.width){
self.x = WIDTH-self.width;
}
if(self.y < self.y/2){
self.y = self.y/2;
}
if(self.y > HEIGHT-self.height){
self.y = HEIGHT-self.height;

}
}

var super_update = self.update;

self.update = function(){

super_update();
if(self.hp <= 0){
var timeSurvived = timeWhenGameStarted;
console.log("You've lost! you survived for " + timeSurvived + " seconds.");
startNewGame();

}

};


self.pressingDown = false;
self.pressingUp = false;
self.pressingLeft = false;
self.pressingRight = false;
self.aimAngle = 0;

return self;

};





Enemy = function(id, x, y, spdX, spdY, width, height){ 

var self =  Actor('enemy', 'MyId', x, y, spdX, spdY, width, height,Img.enemy, 10, 2);

var super_update = self.update;

self.update = function(){
super_update();
self.performAttack();

var isColliding = player.testCollision(self);
if(isColliding){

player.hp = player.hp -1;

}

};

enemyList[id] = self;

};

randomlyGenerateEnemy = function(){

var x = Math.random()*WIDTH; //Math.random() returns number between 0 and 1
var y = Math.random()*HEIGHT;
var height = 64;
var width = 64;
var id = Math.random();
var spdX = 5 + Math.random()*5;
var spdY = 5 + Math.random()*5;
Enemy(id, x, y, spdX, spdY, width, height);

};



Upgrade = function(id, x, y, spdX, spdY, width, height, category, img){ 

var self =  Entity('upgrade', 'MyId', x, y, spdX, spdY, width, height, img);

var super_update = self.update;

self.update = function(){

super_update();
var isColliding = player.testCollision(self);
if(isColliding){
if(self.category === 'score'){
score += 1000;
}

if(self.category === 'atkSpd'){

player.atkSpd += 3;

}

delete upgradeList[self.id]; // delete attribute key
                         
}
};

self.category = category;
upgradeList[id] = self;

};


randomlyGenerateUpgrade = function(){

var x = Math.random()*WIDTH; //Math.random() returns number between 0 and 1
var y = Math.random()*HEIGHT;
var height = 32;
var width = 32;
var id = Math.random();
var spdX = 0;
var spdY = 0;

if(Math.random() < 0.5){

var category = 'score';
var img = Img.upgrade1;

}else{

var category = 'atkSpd';
var img = Img.upgrade2;

}


Upgrade(id, x, y, spdX, spdY, width, height, category, img);

};

Bullet = function(id, x, y, spdX, spdY, width, height){ 

var self =  Entity('bullet', 'MyId', x, y, spdX, spdY, width, height, Img.bullet);

self.timer = 0;

var super_update = self.update;

self.update = function(){

super_update();  
var toRemove = false;
self.timer++;
if(self.timer > 100){

toRemove = true;

}


for(var key2 in enemyList){
/*
var isColliding = bulletList[key].testCollision(enemyList[key2]);
if(isColliding){

toRemove = true;
delete enemyList[key2];
break; // stop the loop

}
*/

}

if(toRemove){
delete bulletList[self.id];
}

};


bulletList[id] = self;

};

GenerateBullet = function(actor, overwrittenAngle){

var x = actor.x;
var y = actor.y;
var height = 32;
var width = 32;
var id = Math.random();
var angle = actor.aimAngle;
if(overwrittenAngle !== undefined){ //undefined is when a variable is not declared in the browser

angle = overwrittenAngle;

}
var spdX = Math.cos(angle/180*Math.PI)*5;
var spdY = Math.sin(angle/180*Math.PI)*5;
Bullet(id, x, y, spdX, spdY, width, height);

};




testCollisionRectRect = function(rect1, rect2){

return rect1.x <= rect2.x+rect2.width
&& rect2.x <= rect1.x+rect1.width
&& rect1.y <= rect1.y+rect2.height
&& rect2.y <= rect1.y+rect1.height

}



