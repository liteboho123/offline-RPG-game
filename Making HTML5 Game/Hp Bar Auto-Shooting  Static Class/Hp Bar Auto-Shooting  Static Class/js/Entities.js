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
var self = Actor('player', 'MyId', 50, 40, 50, 70, Img.player, 10, 1);

var super_update = self.update;

self.update = function(){
super_update();
if(self.pressingMouseLeft){
self.performAttack();
}
if(self.pressingMouseRight){
self.performSpecialAttack();
}

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
if(self.x <= 0 + self.width/2){
self.x = 0 + self.width/2;
}
if(self.x >= currentMap.width*2-self.width){
self.x = currentMap.width*2-self.width;
}
if(self.y <= 0 + self.height/2){
self.y = 0 + self.height/2;
}
if(self.y >= currentMap.height-self.height){
self.y = currentMap.height-self.height;

}
}

self.onDeath = function(){
var timeSurvived = timeWhenGameStarted;
console.log("You've lost! you survived for " + timeSurvived + " seconds.");
startNewGame();

};

self.pressingDown = false;
self.pressingUp = false;
self.pressingLeft = false;
self.pressingRight = false;
self.pressingMouseLeft = false;
self.pressingMouseRight = false;
self.aimAngle = 0;

return self;

};



Actor = function(type, id, x, y, width, height, img, hp, atkSpd){

var self = Entity(type, id, x, y, width, height, img);

self.hp = hp;
self.atkSpd = atkSpd;
self.attackCounter = 0;
self.aimAngle = 0;

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

Maps = function(id, imgSrc, width, height){

var self = {
id:id,
image:new Image(),
width:width,
height:height 
};

self.image.src = imgSrc;

self.draw = function(){
var x = WIDTH/2 - player.x;
var y = HEIGHT/2 - player.y;
ctx.drawImage(self.image, 500, 500, self.image.width, self.image.height, x, y, self.image.width*2, self.image.height*2);
};

return self;

}

currentMap = Maps('field', 'img/map.jpg', 1280, 960);



Enemy = function(id, x, y, width, height, img, hp, atkSpd){ 

var self =  Actor('enemy', 'MyId', x, y, width, height, img, hp, atkSpd);

Enemy.List[id] = self;


self.toRemove = false;

var super_update = self.update;

self.update = function(){
super_update();
self.updateAim();
};

self.updateAim = function(){

var diffX = player.x - self.x;
var diffY = player.y - self.y;


self.aimAngle = Math.atan2(diffY, diffX) / Math.PI * 180;
}

self.onDeath = function(){
self.toRemove = true;
};


self.updatePosition = function(){

var diffX = player.x - self.x;
var diffY = player.y - self.y;

if(diffX > 0){

self.x += 3;

}else{

self.x -= 3;

}


if(diffY > 0){

self.y += 3;

}else{

self.y -= 3;

}

};

};

Enemy.List={};

Enemy.update = function(){
if(frameCount % 100 === 0){ //for every 4 sec

randomlyGenerateEnemy();

}

for(var key in Enemy.List){
Enemy.List[key].update();
Enemy.List[key].performAttack();
}

for(var key in Enemy.List){

if(Enemy.List[key].toRemove){

delete Enemy.List[key];

}
}

};

randomlyGenerateEnemy = function(){

var x = Math.random()*currentMap.width; //Math.random() returns number between 0 and 1
var y = Math.random()*currentMap.height;
var height = 64;
var width = 64;
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

var x = Math.random()*currentMap.width; //Math.random() returns number between 0 and 1
var y = Math.random()*currentMap.height;
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

var super_update = self.update;

self.update = function(){

super_update();

};

self.timer = 0;
self.combatType = combatType;

self.spdX = spdX;
self.spdY = spdY;  

self.updatePosition = function(){

self.x += self.spdX;
self.y += self.spdY;   


if(self.x < 0 + self.width/2 || self.x+self.width >= currentMap.width){

self.spdX = -self.spdX;
}

if(self.y < 0 + self.width/2 || self.y+self.height >= currentMap.height){

self.spdY = -self.spdY;

}

};

Bullet.List[id] = self;

};

Bullet.update = function(){


for(var key in Bullet.List){
var b = Bullet.List[key];
Bullet.List[key].update();
var toRemove = false;
Bullet.List[key].timer++;
if(Bullet.List[key].timer > 75){

toRemove = true;

}

if(Bullet.List[key].combatType === 'player'){

for(var key2 in Enemy.List){

if(Bullet.List[key].testCollision(Enemy.List[key2])){

toRemove = true;
Enemy.List[key2].hp -= 1;

}

}

} else if(Bullet.List[key].combatType === 'enemy'){

if(Bullet.List[key].testCollision(player)){

toRemove = true;
player.hp -= 1;

}

}

if(toRemove){
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



