// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.width = 101;
	this.height = 75;
	this.pointDamage = 500;
	
	// Initial location
	this.x = -this.width;
	this.y = (this.height - 2) * Math.floor((Math.random() * 3) + 1);
	// Initial speed
	this.speed = 1;
	this.speed = (Math.random() + 1) * this.speed * 200;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x += this.speed * dt;
	
	var collisionOffset = 40;
	
	// Handle Collisions
	if((player.x > this.x - collisionOffset && player.x < this.x - collisionOffset + this.width) && (player.y > this.y - collisionOffset && player.y < this.height + this.y - collisionOffset)){
		player.setScore(player.score - this.pointDamage);
		player.reset();
	}
	
	if(this.x > ctx.canvas.width + this.width){
		allEnemies.splice(allEnemies.indexOf(this), 1);
	}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
	// Load the iamge
	this.sprite = 'images/char-boy.png';
	this.width = 101;
	this.height = 75;
	this.verticalOffset = 15;
	this.score = 0;
	this.setScore = function(newScore){
		this.score = newScore;
		var scoreBoardElement = document.querySelector(this.viewIds.scoreBoardId);
		scoreBoardElement.textContent = this.score;
	};
	this.viewIds = {
		scoreBoardId : '#score'	
	};
	
	
	// Initial location
	this.reset();
	this.speed = 1;
};

Player.prototype.reset = function(){
	// Display current score
	this.setScore(this.score);
	
	// Initial location
	this.x = this.width * 2;
	this.y = this.height * 6 - 50;
	
	resetItems();
};

Player.prototype.update = function() {
	if(this.y <= this.verticalOffset){
		this.setScore(this.score + 100);
		this.reset();
	}
}

Player.prototype.getGridX = function(){
	return Math.round(this.x / this.width);
}

Player.prototype.getGridY = function(){
	return Math.round(this.y / this.height);
}
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

Player.prototype.handleInput = function(input){
	var position = null;
	switch(input){		
		case 'left':
			var position = this.x - this.width;
			if(position >= 0){
				this.x = position;
				this.update();
			}
		break;
		case 'right':
			var position = this.x + this.width;
			if(position < ctx.canvas.width){
				this.x = position;
				this.update();
			}
		break;
		case 'up':
			var position = this.y - this.height - this.verticalOffset;
			if(position > -this.height){ // Allow player to potentially stand in water
				this.y = position;
				this.update();
			}
		break;
		case 'down':
			var position = this.y + this.height + this.verticalOffset;
			if(position < ctx.canvas.height -  2 * this.height){
				this.y = position;
				this.update();
			}
		break;
	}
	
	if(this.y === 0){
		player.reset();
	}
};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * An item on the map.
 * 
 * Items can be either Structures that cannot picked up but may allow some interaction, or
 * Pickups which are consumed by the user when touched. 
 */
var Item = function(){
	this.sprite = null;
}
Item.prototype.render = function(){
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
}

Item.prototype.getGridX = function(){
	this.gridX = Math.floor(Math.random() * 5); 
	return this.gridX;
}
Item.prototype.getGridY = function (){
	this.gridY = Math.floor((Math.random() * 3) + 1); 
	return this.gridY;
}

Item.prototype.gridX = null;
Item.prototype.gridY = null;

/**
 * An immobile structure on the map.
 * 
 * This is an Item that is typically considered some physical part of the map. They may allow some
 * interaction, such as moving or consuming, but some such as Rocks are just there as obstacles.
 */
var Structure = function(){
	
}
Structure.prototype = Object.create(Item.prototype);
Structure.prototype.constructor = Structure;

/**
 * A rock obstacle
 * 
 * This kind of Structure is an immobile one that makes the user choose other paths.
 */
var Rock = function(){
	this.sprite = 'images/Rock.png';
}
Rock.prototype = Object.create(Structure.prototype);
Rock.prototype.constructor = Rock;

/**
 * An Item that can consumed by a player
 * 
 * Pickups are Items that the user touches and immediately uses. They typically have beneficial properties,
 * but that is not a requirement.
 */
var Pickup = function(){
	
}
Pickup.prototype = Object.create(Item.prototype);
Pickup.prototype.constructor = Pickup;
Pickup.prototype.points = 0;


Pickup.prototype.update = function(){	
	// Handle Collisions
	if(this.gridX === player.getGridX() && this.gridY === player.getGridY()){
		if(this.points){
			player.setScore(player.score + this.points);
		}
		
		gameData.allItems.splice(gameData.allItems.indexOf(this), 1);	
	}	
};

/**
 * A gem pickup
 * 
 * A user can pick up a gem for extra points
 */
var Gem = function(){
	this.width = 101;
	this.height = 95;
	
	this.x = this.width * this.getGridX();
	this.y = this.height * this.getGridY();
	
	this.spriteList = [
	   'images/Gem Blue.png',
	   'images/Gem Green.png',
	   'images/Gem Orange.png'
	];
	
	this.getSprite = function(){
		var spriteIndex = Math.round(Math.random() * (this.spriteList.length - 1));
		this.sprite = this.spriteList[spriteIndex];
		this.points = 100 * (spriteIndex + 1);
	};
	
	this.getSprite();
}
Gem.prototype = Object.create(Pickup.prototype);
Gem.prototype.constructor = Gem;

player = new Player;
allEnemies = [];
var gameData = {
	allItems : []	
}
resetItems();

function drawItems(){
	if(gameData && gameData.allItems){
		var gemCount;
		for(gemCount = 0; gemCount <= 5; gemCount++){
			var gem;
			var gemExists = true;			
			while(gemExists){
				gem = new Gem;
				gemExists = gameData.allItems.some(function(item){
					return item.gridX === gem.gridX && item.gridY === gem.gridY; 
				});
			}
			
			gameData.allItems.push(gem);
		}
	}	
};

function resetItems(){
	if(gameData && gameData.allItems){
		gameData.allItems = [];
		drawItems();
	}
}

window.setInterval(function(){
	
	if(allEnemies.length < 6){
		allEnemies.push(new Enemy);
	}
	
}, 1000);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
