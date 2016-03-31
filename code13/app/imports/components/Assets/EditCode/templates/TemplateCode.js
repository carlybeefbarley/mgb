

export const templateCode = [
  
  { label: "PhaserJS outline",
    description: "Empty functions for preload(), create() and render()",
    code: `// Start to make a Phaser game.

var game = new Phaser.Game(600, 400, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.crossOrigin = 'anonymous';

    // example of how to load and name an asset to use in code
    // game.load.image('playerThing','/api/asset/png/NvDCRyvPWYD8vfdGW');
    
}
var player;

function create() {
    // player = game.add.sprite(100, 200, 'playerThing');
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
// Player character that can move and jump

var game = new Phaser.Game(600, 400, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.crossOrigin = 'anonymous';

    // example of how to load and name an asset to use in code
    // game.load.image('playerThing','/api/asset/png/NvDCRyvPWYD8vfdGW');    
}

var player;

function create() {
    // player = game.add.sprite(100, 200, 'playerThing');
    game.physics.arcade.enable(player);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 500;

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}


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
  
}`
  }
]