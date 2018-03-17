var player;

Entity = function(type, id, x, y, width, height, img){

var self ={
type:type,
x:x,
y:y,
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

var x = self.x - player.x;
var y = self.y - player.y;

x += WIDTH/2;
y += HEIGHT/2;

x -= self.width/2;
y -= self.height/2;

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

x:self.x - self.width/2,
y:self.y - self.height/2,
width:self.width/2,
height:self.height/2

}

var rect2 = {

x:entity2.x - entity2.width,
y:entity2.y - entity2.height,
width:entity2.width,
height:entity2.height
}

return testCollisionRectRect(rect1, rect2);

};



self.updatePosition = function(){
}

return self;

};

Player = function(){
var self = Actor('player', 'MyId', 50, 40, 50*1.5, 70*1.5, Img.player, 10, 1);

var super_update = self.update;

self.update = function(){
super_update();
if(self.pressingRight || self.pressingLeft || self.pressingDown || self.pressingUp){
self.spriteAnimCounter += 0.2;
}

if(self.pressingMouseLeft){
self.performAttack();
}
if(self.pressingMouseRight){
self.performSpecialAttack();
}

};



self.onDeath = function(){
var timeSurvived = timeWhenGameStarted;
console.log("You've lost! you survived for " + timeSurvived + " seconds.");
startNewGame();

};


self.pressingMouseLeft = false;
self.pressingMouseRight = false;
self.aimAngle = 0;

return self;

};



Actor = function(type, id, x, y, width, height, img, hp, atkSpd){

var self = Entity(type, id, x, y, width, height, img);

self.hp = hp;
self.hpMax = hp;
self.atkSpd = atkSpd;
self.attackCounter = 0;
self.aimAngle = 0;
self.spriteAnimCounter = 0;

self.pressingDown = false;
self.pressingUp = false;
self.pressingLeft = false;
self.pressingRight = false;

self.draw = function(){

ctx.save(); //save current settings

var x = self.x - player.x;
var y = self.y - player.y;

x += WIDTH/2;
y += HEIGHT/2;

x -= self.width/2;
y -= self.height/2;

var frameWidth = self.img.width/3;
var frameHeight = self.img.height/4;

var aimAngle = self.aimAngle;
if(aimAngle < 0){
aimAngle  = 360 + aimAngle;
};


var directionMod = 3; // draw right
if(aimAngle >= 45 && aimAngle < 135){ // down
directionMod = 2;
}
else if(aimAngle >= 135 && aimAngle < 225){ // left
directionMod = 1;
}
else if(aimAngle >= 225 && aimAngle < 315){ //up
directionMod = 0;
}

var walkingMod = Math.floor(self.spriteAnimCounter) % 3; //animation

// ctx.drawImage(Image, cropImagestartx, cropImagestarty, cropImagewidth, cropImageheight, drawCanvasX, drawCanvasY, drawCanvasWidth, drawCanvasHeight);

ctx.drawImage(self.img, walkingMod * frameWidth, directionMod*frameHeight, frameWidth, frameHeight, x, y, self.width, self.height);

ctx.restore(); //restore or bring up

};

self.updatePosition = function(){

var oldX = self.x;
var oldY = self.y;

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
if(self.x <= 0 + self.width/2){
self.x = 0 + self.width/2;
}
if(self.x >= Maps.current.width*2-self.width){
self.x = Maps.current.width*2-self.width;
}
if(self.y <= 0 + self.height/2){
self.y = 0 + self.height/2;
}
if(self.y >= Maps.current.height-self.height){
self.y = Maps.current.height-self.height;
}

if(Maps.current.isPositionWall(self)){

self.x = oldX;
self.y = oldY;

}

}

var super_update = self.update;

self.update = function(){

super_update();
self.attackCounter += self.atkSpd;
if(self.hp <= 0){

self.onDeath();

}

};
self.onDeath = function(){};

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


Enemy = function(id, x, y, width, height, img, hp, atkSpd){ 

var self =  Actor('enemy', 'MyId', x, y, width, height, img, hp, atkSpd);

Enemy.List[id] = self;


self.toRemove = false;

var super_update = self.update;

self.update = function(){
super_update();
self.spriteAnimCounter += 0.2;
self.updateAim();
self.updateKeyPress();
self.performAttack();
};

self.updateAim = function(){

var diffX = player.x - self.x;
var diffY = player.y - self.y;


self.aimAngle = Math.atan2(diffY, diffX) / Math.PI * 180;
}


self.updateKeyPress = function(){

var diffX = player.x - self.x;
var diffY = player.y - self.y;


self.pressingRight = diffX > 3;
self.pressingLeft = diffX < -3;
self.pressingDown = diffY > 3;
self.pressingUp = diffY < -3;
}


var super_draw = self.draw;

self.draw = function(){
super_draw();

var x = self.x - player.x + WIDTH/2;
var y = self.y - player.y + HEIGHT/2 - self.height/2 - 20;

ctx.save();

ctx.fillStyle = 'red';
var width = 100 * self.hp/self.hpMax; 
if(width < 0){
 width = 0;
}

ctx.fillRect(x - 50, y, width, 10);
ctx.strokeStyle = "black";
ctx.strokeRect(x - 50, y, 100, 10);
ctx.restore();
};


self.onDeath = function(){
self.toRemove = true;
};

};

Enemy.List={};

Enemy.update = function(){
if(frameCount % 100 === 0){ //for every 4 sec

randomlyGenerateEnemy();

}

for(var key in Enemy.List){
Enemy.List[key].update();
}

for(var key in Enemy.List){

if(Enemy.List[key].toRemove){

delete Enemy.List[key];

}
}

};

randomlyGenerateEnemy = function(){

var x = Math.random()*Maps.current.width; //Math.random() returns number between 0 and 1
var y = Math.random()*Maps.current.height;
var height = 64*1.5;
var width = 64*1.5;
var id = Math.random();
if(Math.random() > 0.5){
Enemy(id, x, y, width, height, Img.bat, 2, 1);
}else{

Enemy(id, x, y, width, height, Img.bee, 1, 3);

}

};



Upgrade = function(id, x, y, width, height, category, img){ 

var self =  Entity('upgrade', 'MyId', x, y,  width, height, img);

var super_update = self.update;

self.update = function(){

super_update();

};

self.category = category;
Upgrade.List[id] = self;

};

Upgrade.update = function(){

if(frameCount % 75 === 0){ //for every 3 sec

randomlyGenerateUpgrade();

}

for(var key in Upgrade.List){
Upgrade.List[key].update();

var isColliding = player.testCollision(self);

if(isColliding){

if(Upgrade.List[key].category === 'score'){
score += 1000;
}

if(Upgrade.List[key].category === 'atkSpd'){

player.atkSpd += 3;

}

delete Upgrade.List[key]; // delete attribute key
                         
}

}

};

Upgrade.List={};

randomlyGenerateUpgrade = function(){

var x = Math.random()*Maps.current.width; //Math.random() returns number between 0 and 1
var y = Math.random()*Maps.current.height;
var height = 32;
var width = 32;
var id = Math.random();

if(Math.random() < 0.5){

var category = 'score';
var img = Img.upgrade1;

}else{

var category = 'atkSpd';
var img = Img.upgrade2;

}


Upgrade(id, x, y, width, height, category, img);

};

Bullet = function(id, x, y, spdX, spdY, width, height, combatType){ 

var self =  Entity('bullet', 'MyId', x, y, width, height, Img.bullet);

self.timer = 0;
self.combatType = combatType;

self.spdX = spdX;
self.spdY = spdY;  
self.toRemove = false;

var super_update = self.update;

self.update = function(){
super_update();


self.timer++;
if(self.timer > 75){

self.toRemove = true;

}

if(self.combatType === 'player'){

for(var key2 in Enemy.List){

if(self.testCollision(Enemy.List[key2])){

self.toRemove = true;
Enemy.List[key2].hp -= 1;

}

}

} else if(self.combatType === 'enemy'){

if(self.testCollision(player)){

self.toRemove = true;
player.hp -= 1;

}

}

if(Maps.current.isPositionWall(self)){

self.toRemove = true;

}
};


self.updatePosition = function(){

self.x += self.spdX;
self.y += self.spdY;   


if(self.x < 0 + self.width/2 || self.x+self.width >= Maps.current.width){

self.spdX = -self.spdX;
}

if(self.y < 0 + self.width/2 || self.y+self.height >= Maps.current.height){

self.spdY = -self.spdY;

}

};

Bullet.List[id] = self;

};

Bullet.update = function(){


for(var key in Bullet.List){
var b = Bullet.List[key];
b.update();



if(b.toRemove){
delete Bullet.List[key];
}

}

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
Bullet(id, x, y, spdX, spdY, width, height, actor.type);

};



testCollisionRectRect = function(rect1, rect2){

return rect1.x <= rect2.x+rect2.width
&& rect2.x <= rect1.x+rect1.width
&& rect1.y <= rect1.y+rect2.height
&& rect2.y <= rect1.y+rect1.height

}



