/**
 * Enemies our player must avoid
 */
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

/**
 * Update the enemy's position, required method for game
 * 
 * @param {Number} dt a time delta between ticks 
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x += this.speed * dt;
	
	var collisionOffset = 40;
	
	// Handle Collisions
	if((player.x > this.x - collisionOffset && player.x < this.x - collisionOffset + this.width) && (player.y > this.y - collisionOffset && player.y < this.height + this.y - collisionOffset)){
		player.setScore(player.score - this.pointDamage);
		player.changeHealth(-1);
		player.reset();
	}
	
	if(this.x > ctx.canvas.width + this.width){
		allEnemies.splice(allEnemies.indexOf(this), 1);
	}
};

/**
 * Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/**
 * A player the user controls.
 * 
 * @class
 */
var Player = function(){
	// Load the image
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

Player.maxLives = 3;

/**
 * Reset the player's position and set current score
 * 
 */
Player.prototype.reset = function(){
	// Display current score
	this.setScore(this.score);
	
	// Initial location
	this.x = this.width * 2;
	this.y = this.height * 6 - 50;
};

Player.prototype.changeHealth = function(change){
	var livespanel = document.querySelector('#livespanel');
	
	if(change > 0){
		for(var i = 0; i < change; i++){
			var livesListItems = document.querySelectorAll('#livespanel li');
			if(livesListItems.length === Player.maxLives){
				return;
			}
			
			var lifeListItem = document.createElement('li');
			lifeListItem.className = 'playerLife';
			lifeListItem.style.backgroundImage = 'url("' + this.sprite; '")';
			livespanel.appendChild(lifeListItem);
		}
	} else {
		change *= -1;
		for(var i = 0; i < change; i++){
			if(livespanel.firstElementChild){
				livespanel.removeChild(livespanel.firstElementChild);
			} else {
				endGame();
			}
		}		
	}
}

Player.prototype.resetLives = function(){
	var livespanel = document.querySelector('#livespanel');
	
	while(livespanel.firstChild){
		livespanel.removeChild(livespanel.firstChild);
	}
	
	for(var i = 0; i < Player.maxLives; i++){
		var lifeListItem = document.createElement('li');
		lifeListItem.className = 'playerLife';
		lifeListItem.style.backgroundImage = 'url("' + this.sprite; '")';
		livespanel.appendChild(lifeListItem);
	}
}

/**
 * Update the player's state
 */
Player.prototype.update = function() {
	// Raise the score if the player reached the water
	if(this.y <= this.verticalOffset){
		this.setScore(this.score + 100);
		resetMap();
	}
	
	// End the game if the player's points are less than zero
	if(player.score < 0 && gameData.gameState !== 'ended'){
		endGame();
	}
}

/**
 * Get the player's x position on the sidewalk grid
 * @returns {Number} The x grid coordinate on the sidewalk
 */
Player.prototype.getGridX = function(){
	return Math.round(this.x / this.width);
}

/**
 * Get the player's y position on the sidewalk grid
 * @returns {Number} The y grid coordinate on the sidewalk	
 */
Player.prototype.getGridY = function(){
	return Math.round(this.y / this.height);
}
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

/**
 * Handle the user's input to control the character
 */
Player.prototype.handleInput = function(input){
	if(gameData.gameState === 'ended'){
		return;
	}
	
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
		resetMap();
	}
};

/**
 * Draw the player on the canvas
 */
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
	
	this.x = this.width * this.getGridX();
	this.y = this.height * this.getGridY();
	
	this.getSprite();
}

Item.prototype.getSprite = function(){
	var spriteIndex = Math.round(Math.random() * (this.spriteList.length - 1));
	this.sprite = this.spriteList[spriteIndex];	
};

/**
 * Draw the item on the canvas
 */
Item.prototype.render = function(){
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
}

/**
 * Initialize the item's x coordinate on the sidewalk grid
 * @returns {Number} The item's x coordinate on the sidewalk grid
 */
Item.prototype.getGridX = function(){
	this.gridX = Math.floor(Math.random() * 5); 
	return this.gridX;
}

/**
 * Initialize the item's y coordinate on the sidewalk grid
 * @returns {Number} The item's y coordinate on the sidewalk grid
 */
Item.prototype.getGridY = function (){
	this.gridY = Math.floor((Math.random() * 3) + 1); 
	return this.gridY;
}

/**
 * The item's x coordinate on the sidewalk grid
 * @member {Number}
 */
Item.prototype.gridX = null;
/**
 * The item's y coordinate on the sidewalk grid
 * @member {Number}
 */
Item.prototype.gridY = null;

/**
 * The list of sprites representing this item.
 */
Item.prototype.spriteList = [];

/**
 * An immobile structure on the map.
 * 
 * This is an Item that is typically considered some physical part of the map. They may allow some
 * interaction, such as moving or consuming, but some such as Rocks are just there as obstacles.
 * 
 * @class
 */
var Structure = function(){
	Item.call(this);
}
Structure.prototype = Object.create(Item.prototype);
Structure.prototype.constructor = Structure;

/**
 * A rock obstacle
 * 
 * This kind of Structure is an immobile one that makes the user choose other paths.
 * 
 * @class
 */
var Rock = function(){
	this.sprite = 'images/Rock.png';
	Structure.call(this);
}
Rock.prototype = Object.create(Structure.prototype);
Rock.prototype.constructor = Rock;

/**
 * An Item that can consumed by a player
 * 
 * Pickups are Items that the user touches and immediately uses. They typically have beneficial properties,
 * but that is not a requirement.
 * 
 * @class
 */
var Pickup = function(){
	Item.call(this);
}
Pickup.prototype = Object.create(Item.prototype);
Pickup.prototype.constructor = Pickup;
Pickup.prototype.points = 0;

/**
 * Detect collisions with players
 */
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

	this.spriteList = [
	   'images/Gem Blue.png',
	   'images/Gem Green.png',
	   'images/Gem Orange.png'
	];
	
	Pickup.call(this);
	
	this.points = 100 * (this.spriteList.indexOf(this.sprite) + 1);
}
Gem.prototype = Object.create(Pickup.prototype);
Gem.prototype.constructor = Gem;

/**
 * A heart pickup
 * 
 * Restores health and adds points.
 */
var Heart = function(){
	this.width = 101;
	this.height = 120;
	
	this.spriteList = [
	  'images/Heart.png'
	];
	
	Pickup.call(this);
	
	this.x = (this.width) * this.getGridX();
	this.y = (this.height - 30) * this.getGridY();
	
	this.points = 300;
};
Heart.prototype = Object.create(Pickup.prototype);
Heart.prototype.constructor = Heart;

Heart.prototype.update = function(){
	Pickup.prototype.update.call(this);
	
	if(this.gridX === player.getGridX() && this.gridY === player.getGridY()){
		player.changeHealth(1);	
	}
};

var player = null;
var allEnemies = [];
var gameData = {
	allItems : [],
	gameState: 'in-level' // in-level, ended, character-select
}
intializeMap();

/**
 * Initialize the map
 */
function intializeMap(){
	player = new Player;
	startGame();
}

/**
 * Reset the map
 */
function resetMap(){
	resetItems();
	player.reset();
}

/**
 * Draw all map items on the canvas
 */
function drawItems(){
	if(gameData && gameData.allItems){
		var newItemCount;
		for(newItemCount = 0; newItemCount < 6; newItemCount++){
			var newItem;			
			var itemInPosition = true;			
			while(itemInPosition){
				var hasHeart = gameData.allItems.some(function(item){
					return item instanceof Heart; 
				});
				
				if(!hasHeart){
					newItem = new Heart;
				} else {
					newItem = new Gem;
				}
				
				itemInPosition = gameData.allItems.some(function(item){
					return item.gridX === newItem.gridX && item.gridY === newItem.gridY; 
				});
			}
			
			gameData.allItems.push(newItem);
		}
	}	
};

/**
 * Clear the list of map items and remake them.
 */
function resetItems(){
	if(gameData && gameData.allItems){
		gameData.allItems = [];
		drawItems();
	}
}

/**
 * End the game and show the Game Over messages
 */
function endGame(){
	var canvasOverlay = document.querySelector('#canvasOverlay');
	var main_caption = document.createElement('div');
	main_caption.id = 'main_caption';
	main_caption.textContent = 'Game Over';
	
	var emptySpan = document.createElement('span');
	emptySpan.className = 'empty';
	
	var bottom_caption = document.createElement('div');
	bottom_caption.id = 'bottom_caption';
	bottom_caption.textContent = 'Press any key to continue';
	canvasOverlay.className = 'gameover';
	
	canvasOverlay.appendChild(main_caption);
	canvasOverlay.appendChild(bottom_caption);
	canvasOverlay.insertBefore(emptySpan, main_caption);	
	
	gameData.gameState = 'ended';
	canvasOverlay.addEventListener('animationend', function(){
		document.addEventListener('keyup', restartOnKeyUp);
	});
}

function restartOnKeyUp(event){
	if(gameData.gameState === 'ended'){
		startGame();
	}
}

/**
 * Start the game
 */
function startGame(){
	document.removeEventListener('keyup', restartOnKeyUp);
	var canvasOverlay = document.querySelector('#canvasOverlay');
	canvasOverlay.className = '';

	// Clear the canvas overlay
	while(canvasOverlay.firstChild){
		canvasOverlay.removeChild(canvasOverlay.firstChild);
	}
	
	gameData.gameState = 'in-level';
	player.score = 0;
	
	// Reset the player's lives
	player.resetLives();
	resetMap();
}

/*
 * Push enemies onto map every second. Keep a maximum of enemies.
 */
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
