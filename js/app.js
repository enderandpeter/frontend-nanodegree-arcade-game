// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.width = 101;
	this.height = 75;
	
	// Initial location
	this.x = -this.width;
	this.y = this.height * Math.floor((Math.random() * 3) + 1);
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
	
	// Handle Collisions
	if((player.x > this.x && player.x < this.x + this.width) && (player.y > this.y && player.y < this.height + this.y)){
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
	
	// Initial location
	this.reset();
	this.speed = 1;
};

Player.prototype.reset = function(){
	// Initial location
	this.x = this.width * 2;
	this.y = this.height * 6 - 50;
};

Player.prototype.update = function() {

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
			var position = this.y - this.height - 15;
			if(position > 0){
				this.y = position;
				this.update();
			}
		break;
		case 'down':
			var position = this.y + this.height + 15;
			if(position < ctx.canvas.height){
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

player = new Player;
allEnemies = [];

window.setInterval(function(){
	
	allEnemies.push(new Enemy);
	
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
