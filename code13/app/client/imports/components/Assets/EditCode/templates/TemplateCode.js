export const templateCode = [
  {
    label: 'Phaser: Basic outline',
    description: 'Empty functions for a Phaser game with preload(), create() and render()',
    code: `// Start to make a Phaser game.
import Phaser from 'phaser'
const game = new Phaser.Game(600, 400, Phaser.AUTO, 'game', {
  preload: preload,
  create: create,
  update: update,
  render: render
})

// In a Phaser game, this is needed to enable screenshots if using WebGL renderer (because of Phaser.AUTO)
game.preserveDrawingBuffer = true

function preload() {

  game.load.crossOrigin = 'anonymous'

  // Example of how to load and name an asset to use in code.
  // You can drag assets from the right hand Assets panel towards
  // this code area to generate these kinds of api/url links:
  game.load.image('playerThing', '/api/asset/png/2ojWGXPXC99A7eDP7')

}
let player

function create() {
  game.stage.backgroundColor = 'rgba(68, 136, 170, 0.5)'
  player = game.add.sprite(100, 200, 'playerThing')
}

function update() {

}

function render() {

}`,
  },

  {
    label: 'Phaser: Moving player',
    description: 'Phaser base template with player character that can move and jump',
    code: `// Start to make a Phaser game.

import Phaser from 'phaser'
// Create the Phaser Game.
//
const game = new Phaser.Game(
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
) // end of new Phaser.Game() construction

let player // Declare this variable for the player so we can reference it in our functions

// In a Phaser game, this is needed to enable screenshots if using WebGL renderer (because of Phaser.AUTO)
game.preserveDrawingBuffer = true

// Next, we should actually define the functions we just told Phaser about...

// preload is for preloading/downloading assets we need for our game, like graphics
function preload() {
    game.load.crossOrigin = 'anonymous'

    // example of how to load and name an MGB asset to use in code
    // You can drag assets from the right hand Assets panel towards
    // this code area to generate these kinds of api/url links:
    game.load.image('playerThing','/api/asset/png/2ojWGXPXC99A7eDP7')
}

// This function is called after the preload() work has downloaded stuff we need
function create() {
    game.stage.backgroundColor = 'rgba(68, 136, 170, 0.5)'

    player = game.add.sprite(100, 200, 'playerThing')
    game.physics.arcade.enable(player)

    player.body.collideWorldBounds = true
    player.body.gravity.y = 500

    cursors = game.input.keyboard.createCursorKeys()
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
}

// This function will be called multiple times per second when the game
// is running
function update () {
    player.body.velocity.x = 0

    if (cursors.left.isDown)
        player.body.velocity.x = -250
    else if (cursors.right.isDown)
        player.body.velocity.x = 250

    if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down))
      player.body.velocity.y = -400

    // Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && (player.body.onFloor() || player.body.touching.down))
        player.body.velocity.y = -350
}

function render()
{
  // We don't need to do anything special here for this demo yet since
  // the object we created includes the needed logic to draw it
}`,
  },

  {
    label: 'Phaser: Load MGB Map in Phaser',
    description: 'Load a MGB Map into a Phaser Game',
    code: `

import Phaser from 'phaser'

// MGB map loader adds mgbMap functionality to the Phaser.Loader and Phaser object factory
import '/!vault:mgb-map-loader-extended'

// 800 and 600 here is just initial width and height - we will automatically adjust game size to fit map
const game = new Phaser.Game(800, 600, Phaser.AUTO, document.body, {
  preload: function(){
    // first argument is map name (initialMap) - used later to create loaded map
    // you can choose any name - just don't forget to use changed name in the create function below
    // replace {userName} with map owner name
    // replace {mapName} with map name
    this.game.load.mgbMap('initialMap', '/{userName}/{mapName}')

    // this tells Phaser.ScaleManager to show all world on a single screen
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
  },

  create: function(){
    /*
    mgb map structure: {
      data, // raw map data in tiled json format https://github.com/bjorn/tiled/wiki/JSON-Map-Format
      layers, // Object containing layer with name - layer can be either objectgroup or tilemaplayer
      map // reference to Phaser Tilemap http://phaser.io/docs/2.6.2/Phaser.Tilemap.html
    }
    */
    // create and put it on the screen
    const mgbMap = this.game.create.mgbMap('initialMap')

    // determine map size in the pixels
    const mapWidthInPx =  mgbMap.data.width * mgbMap.data.tilewidth
    const mapHeightInPx =  mgbMap.data.height* mgbMap.data.tileheight

    // set world bounds to match map size
    this.game.world.setBounds(0, 0, mapWidthInPx, mapHeightInPx)

    // adjust game size - to fit map on the screen
    this.game.scale.setGameSize(mapWidthInPx, mapHeightInPx)
  }
})
// allow to take screenshots in the WebGL mode
game.preserveDrawingBuffer = true;
`,
  },
  {
    label: 'React: Class-based React Component',
    description: 'Empty Component filled with commented lifecycle methods - ready for export',
    code: `//https://facebook.github.io/react/docs/reusable-components.html#es6-classes
//https://facebook.github.io/react/docs/component-specs.html

import React from "react"

export default class extends React.Component {

  /*
    Define default values for your props
  */
  static defaultProps = {}

  /*
    React.PropTypes exports a range of validators that can be used to make sure the data you receive is valid.
    When an invalid value is provided for a prop, a warning will be shown in the JavaScript console.
    Note that for performance reasons propTypes is only checked in development mode
    https://facebook.github.io/react/docs/reusable-components.html
  */
  static propTypes = {}

  constructor(...args) {
    super(...args)
    this.state = {}
  }

  /*
    Invoked once, both on the client and server, immediately before the initial rendering occurs.
    If you call setState within this method, render() will see the updated state and will be executed only once despite the state change.
  */
  componentWillMount() {

  }

  /*
    Invoked once, only on the client (not on the server), immediately after the initial rendering occurs.
    At this point in the lifecycle, you can access any refs to your children (e.g., to access the underlying DOM representation).
    The componentDidMount() method of child components is invoked before that of parent components.
    If you want to integrate with other JavaScript frameworks, set timers using setTimeout or setInterval, or send AJAX requests,
    perform those operations in this method.
  */
  componentDidMount() {

  }

  /*
    Invoked when a component is receiving new props. This method is not called for the initial render.
    Use this as an opportunity to react to a prop transition before render() is called by updating the state using this.setState().
    The old props can be accessed via this.props.
    Calling this.setState() within this function will not trigger an additional render.
  */
  componentWillReceiveProps(nextProps) {

  }

  /*
    Invoked before rendering when new props or state are being received.
    This method is not called for the initial render or when forceUpdate is used.
    Use this as an opportunity to return false when you're certain that the transition to the new props and state will not require a component update.
  */
  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  /*
    Invoked immediately before rendering when new props or state are being received.
    This method is not called for the initial render.
    Use this as an opportunity to perform preparation before an update occurs.
  */
  componentWillUpdate(nextProps, nextState) {

  }

  /*
    Invoked immediately after the component's updates are flushed to the DOM.
    This method is not called for the initial render.
    Use this as an opportunity to operate on the DOM when the component has been updated.
  */
  componentDidUpdate(prevProps, prevState) {

  }

  /*
    Invoked immediately before a component is unmounted from the DOM.
    Perform any necessary cleanup in this method, such as invalidating timers or cleaning up any DOM elements that were created in componentDidMount.
  */
  componentWillUnmount() {

  }

  /*
    The render() method is required.
    When called, it should examine this.props and this.state and return a single child element.
    This child element can be either a virtual representation of a
    native DOM component (such as <div /> or React.DOM.div())
    or another composite component that you've defined yourself.
    You can also return null or false to indicate that you don't want anything rendered.
    Behind the scenes, React renders a <noscript> tag to work with our current diffing algorithm.
    When returning null or false, ReactDOM.findDOMNode(this) will return null.
    The render() function should be pure, meaning that it does not modify component state,
    it returns the same result each time it's invoked,
    and it does not read from or write to the DOM or otherwise interact with the browser (e.g., by using setTimeout).
    If you need to interact with the browser, perform your work in componentDidMount() or the other lifecycle methods instead.
    Keeping render() pure makes server rendering more practical and makes components easier to think about.
  */
  render() {
    return (
      <div>Hello {this.props.name}</div>
    )
  }
}
`,
  },

  {
    label: 'React: Simple Class Component',
    description: 'Empty Component - ready for export',
    code: `import React from "react"
export default class extends React.Component {

  static defaultProps = {
    name: "world"
  }

  // https://facebook.github.io/react/docs/reusable-components.html
  static propTypes = {

  }

  // add listeners / timeouts / interval etc here
  componentDidMount() {

  }

  // clean up everything from componentDidMount
  componentWillUnmount() {

  }

  render() {
    return <div>Hello {this.props.name}!</div>
  }
}
`,
  },
]
