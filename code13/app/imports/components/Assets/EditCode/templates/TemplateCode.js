

export const templateCode = [
  
  { label: "PhaserJS outline",
    description: "Empty functions for preload(), create() and render()",
    code: `// Start to make a Phaser game.
//MGBOPT_phaser_version = 2.4.6

var game = new Phaser.Game(600, 400, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.crossOrigin = 'anonymous';

    // example of how to load and name an asset to use in code
    game.load.image('playerThing','/api/asset/png/2ojWGXPXC99A7eDP7');
    
}
var player;

function create() {
    player = game.add.sprite(100, 200, 'playerThing');
}

function update () {

}

function render() 
{
  
}`
  },
  
  { label: "Moving player",
    description: "Player character that can move and jump",
    code: `// Start to make a Phaser game.
//MGBOPT_phaser_version = 2.4.7

// Create the Phaser Game. 
// 
var game = new Phaser.Game(
   "100", // Phaser.Game uses this number in quotes to mean % of screen width
   window.innerHeight - 40, // another way to automatically calculate size (height) 
   Phaser.AUTO, // Automatically choose the fastest renderer type for this browser
   'mygame', // The name of this game
   { 
     // now we need to tell phaser what we decided to call various functions it will need 
     // so the game can work.
     preload: preload, // The preload function is called preload (it is defined below)
     create: create,   // The create function is called create (it is defined below)
     update: update,   // The update function is called update (it is defined below)
     render: render    // the render function is called render (it is defined below)
    }
); // end of new Phaser.Game() construction

var player; // Declare this variable for the player so we can reference it in our functions


// Next, we should actually define the functions we just told Phaser about...

// preload is for preloading/downloading assets we need for our game, like graphics
function preload() {
    game.load.crossOrigin = 'anonymous';

    // example of how to load and name an MGB asset to use in code
    game.load.image('playerThing','/api/asset/png/2ojWGXPXC99A7eDP7');    
}

// This function is called after the preload() work has downloaded stuff we need
function create() {
    player = game.add.sprite(100, 200, 'playerThing');
    game.physics.arcade.enable(player);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 500;

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

// This function will be called multiple times per second when the game
// is running
function update () {
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
        player.body.velocity.x = -250;
    else if (cursors.right.isDown)
        player.body.velocity.x = 250;

    if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down))
      player.body.velocity.y = -400;
  
    // Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && (player.body.onFloor() || player.body.touching.down))
        player.body.velocity.y = -350;
}

function render() 
{
  // We don't need to do anything special here for this demo yet since
  // the object we created includes the needed logic to draw it
}`
  }
]