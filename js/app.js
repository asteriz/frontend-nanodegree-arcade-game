var data = {
    score: 0,
    gems: [],
    difficulty: ['Easy', 'Normal', 'Hard'],
    playerChars: [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ],
    genareteGem: function() {
        var gemNames = [
            'images/Rock.png',
            'images/Gem Blue.png',
            'images/Gem Blue.png',
            'images/Gem Orange.png'
        ];
        data.gems = [];
        var numOfGem = Math.ceil(config.numRows * 0.7) - 3;
        for (var i = 0; i < numOfGem; i++) {
            var gemName, row, col, isRock, isOccupiedPosition;
            do {
                gemIndex = Math.floor(Math.random() * gemNames.length);
                if (gemIndex === 0) {
                    isRock = true;
                } else {
                    isRock = false;
                }
                gemName = gemNames[gemIndex];
                row = Math.floor(Math.random() * (config.numRows - 3));
                col = Math.floor(Math.random() * config.numCols);

                isOccupiedPosition = false;
                for (var j = 0; j < data.gems.length; j++){
                    if (data.gems[j].row === row && data.gems[j].col === col) {
                        isOccupiedPosition = true;
                        break;
                    }
                }
            } while (isOccupiedPosition);

            data.gems.push({
                name: gemName,
                row: row,
                col: col,
                isRock: isRock
            });
        }
    }
};

var config = {
    numRows: 6,             // adjustable (suggestion: 5 - 8)
    numCols: 5,
    spriteWidth: 101,
    spriteHeight: 83,
    enemyPosOffset: 60,
    playerPosOffset: 48,
    difficultyLevel: 1     // normal (default)
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.initialLocationAndSpeed();
};

// Initialize location and speed
Enemy.prototype.initialLocationAndSpeed = function() {
    this.row = Math.floor(Math.random() * (config.numRows - 3));
    this.x = -(Math.random() * config.spriteWidth * config.numCols) - config.spriteWidth;
    this.y =  this.row * config.spriteHeight + config.enemyPosOffset;
    this.speed = this.calculateSpeed(config.difficultyLevel);
};

// Calculate speed depend on difficulty
Enemy.prototype.calculateSpeed = function(difficultyLevel) {
    var speed;
    switch (data.difficulty[difficultyLevel]) {
        case 'Easy':
            speed = (Math.random() + 0.5) * 100;
            break;
        case 'Normal':
        default:
            speed = (Math.random() + 0.6) * 200;
            break;
        case 'Hard':
            speed = (Math.random() + 0.7) * 400;
            break;
    }
    return speed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x >= config.spriteWidth * 5) {
        this.initialLocationAndSpeed();
    } else {
        this.x += this.speed * dt;
        if (this.checkCollisions()) {
            this.initialLocationAndSpeed();
            player.initialLocation();
            data.score -= 200;
        }
    }
};

// Check if enemy collides with player
Enemy.prototype.checkCollisions = function() {
    var isCollision = false;
    if (this.row === player.row &&
        this.x >= (player.x - 50) &&
        this.x <= player.x + 50) {
        isCollision = true;
    }
    return isCollision;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.charIndex = Math.floor(Math.random() * data.playerChars.length);
    this.sprite = data.playerChars[this.charIndex];
    data.score = 0;
    this.initialLocation();
};

Player.prototype.initialLocation = function() {
    this.row = config.numRows - 2;
    this.col = 2;
};

Player.prototype.update = function() {
    this.x = config.spriteWidth * this.col;
    this.y = config.spriteHeight * this.row + config.playerPosOffset;
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
    var destRow = this.row;
    var destCol = this.col;
    var isWon = false;
    switch(key) {
        case 'enter':    // Change difficulty
            config.difficultyLevel ++;
            if (config.difficultyLevel >= data.difficulty.length) {
                config.difficultyLevel = 0;
            }
            allEnemies.forEach(function(enemey) {
                enemey.speed = enemey.calculateSpeed(config.difficultyLevel);
            });
            break;
        case '[':    // Change player's character
            this.charIndex--;
            if (this.charIndex < 0) {
                this.charIndex = data.playerChars.length - 1;
            }
            this.sprite = data.playerChars[this.charIndex];
            break;
        case ']':    // Change player's character
            this.charIndex++;
            if (this.charIndex >= data.playerChars.length) {
                this.charIndex = 0;
            }
            this.sprite = data.playerChars[this.charIndex];
            break;
        case 'left':
            if (destCol > 0) {
                destCol--;      // Intend to move left
            }
            break;
        case 'up':
            if (destRow > 0) {
                destRow--;      // Intend to move up
            } else {
                isWon = true;   // Reached water
            }
            break;
        case 'right':
            if (destCol < config.numCols - 1) {
                destCol++;      // Intend to move right
            }
            break;
        case 'down':
            if (destRow < config.numRows - 2) {
                destRow++;      // Intend to move down
            }
            break;
        default:
    }

    if (isWon) {    // Won
        data.score += 100;
        data.genareteGem();
        this.initialLocation();
    } else {
        var gem = this.pickGem(destRow, destCol);
        switch (gem) {
            case 'rock':    // Stay, do nothing
                break;
            case 'gem':     // Get bonus
                data.score += 50;
            default:        // Move
                this.row = destRow;
                this.col = destCol;
                this.update();
                break;
        }
    }
};

Player.prototype.pickGem = function(row, col) {
    var result = 'none';
    for (var i = 0; i < data.gems.length; i++) {
        var gem = data.gems[i];
        if (gem.row === row && gem.col === col) {
            if (gem.isRock === true) {
                result = 'rock';
            } else {
                result = 'gem'
                data.gems.splice(i, 1); // Remove gem
            }
            break;
        }
    }
    return result;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var numOfEnemy = Math.ceil(config.numRows * 1.16) - 3;
for (var num = 0; num < numOfEnemy; num++) {
    allEnemies.push(new Enemy());
}

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: 'enter',
        219: '[',
        221: ']',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
