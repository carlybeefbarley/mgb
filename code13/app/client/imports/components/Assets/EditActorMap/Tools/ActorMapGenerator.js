import _ from 'lodash'
import React from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'
import { showToast } from '/client/imports/modules'
import { Popup, Form, Radio, Input, Segment, Button, Loader } from 'semantic-ui-react'

export default class ActorMapGenerator extends React.Component {
  constructor(props) {
    super(props)
    this.maze = []
    this.random = []
    this.state = { mode: 1, isLoading: false }
  }

  handleRadioClick(data) {
    if (data.label === 'Maze' && !data.checked) this.setState({ mode: 1 })
    else if (data.label === 'Random Placement' && !data.checked) this.setState({ mode: 2 })
  }

  handleReseed = () => {
    this.maze = []
  }

  handleGenerate = () => {
    joyrideCompleteTag(`mgbjr-CT-MapTools-generator-generate`)
    this.generateMaze()
  }

  // Algorithm from http://www.emanueleferonato.com/2015/06/30/pure-javascript-perfect-tile-maze-generation-with-a-bit-of-magic-thanks-to-phaser/
  generateMaze() {
    const { data, activeTileset, activeLayer } = this.props

    if (!activeTileset) {
      showToast.warning('Must select an actor tile to generate')
      return
    }

    this.setState({ isLoading: true })

    const mazeWidth = data.width % 2 === 0 ? data.width - 1 : data.width
    const mazeHeight = data.height % 2 === 0 ? data.height - 1 : data.height

    if (this.maze.length === 0) {
      var totalCells = mazeWidth * mazeHeight

      var moves = []
      this.maze = _.times(mazeHeight, i => _.times(mazeWidth, j => 1))

      var posX = 1
      var posY = 1
      this.maze[posX][posY] = 0
      moves.push(posY + posY * mazeWidth)
      for (var cell = 0; cell < totalCells; ++cell) {
        if (moves.length) {
          var possibleDirections = ''
          if (posX + 2 > 0 && posX + 2 < mazeHeight - 1 && this.maze[posX + 2][posY] === 1) {
            possibleDirections += 'S'
          }
          if (posX - 2 > 0 && posX - 2 < mazeHeight - 1 && this.maze[posX - 2][posY] === 1) {
            possibleDirections += 'N'
          }
          if (posY - 2 > 0 && posY - 2 < mazeWidth - 1 && this.maze[posX][posY - 2] === 1) {
            possibleDirections += 'W'
          }
          if (posY + 2 > 0 && posY + 2 < mazeWidth - 1 && this.maze[posX][posY + 2] === 1) {
            possibleDirections += 'E'
          }
          if (possibleDirections) {
            var move = Math.floor(Math.random() * (possibleDirections.length + 1))
            switch (possibleDirections[move]) {
              case 'N':
                this.maze[posX - 2][posY] = 0
                this.maze[posX - 1][posY] = 0
                posX -= 2
                break
              case 'S':
                this.maze[posX + 2][posY] = 0
                this.maze[posX + 1][posY] = 0
                posX += 2
                break
              case 'W':
                this.maze[posX][posY - 2] = 0
                this.maze[posX][posY - 1] = 0
                posY -= 2
                break
              case 'E':
                this.maze[posX][posY + 2] = 0
                this.maze[posX][posY + 1] = 0
                posY += 2
                break
            }
            moves.push(posY + posX * mazeWidth)
          } else {
            var back = moves.pop()
            posX = Math.floor(back / mazeWidth)
            posY = back % mazeWidth
          }
        }
      }
    }

    this.props.saveForUndo('Generate maze')

    let layer = -1
    if (ActorHelper.checks['Background'](data.tilesets[activeTileset])) {
      layer = 0
    } else if (ActorHelper.checks['Active'](data.tilesets[activeTileset])) {
      layer = 1
    } else if (ActorHelper.checks['Foreground'](data.tilesets[activeTileset])) {
      layer = 2
    }

    // Scenery is compatible in both background and foreground, pick active layer
    if (data.tilesets[activeTileset].actor.databag.all.actorType === '4') {
      layer = activeLayer === 0 || activeLayer === 2 ? activeLayer : layer
    }

    if (layer === -1) {
      showToast.warning(
        'The selected tile cannot be used with this tool or there is a layer incompatibility issue.',
      )
      return
    }

    _.times(mazeHeight, row => {
      _.times(mazeWidth, col => {
        if (this.maze[row][col]) data.layers[layer].data[row * data.width + col] = activeTileset * 100 + 1
      })
    })

    this.props.handleSave('Generate maze')

    this.setState({ isLoading: false })
  }

  generateRandom() {
    this.props.onGenerateRandom(this.random)
  }

  renderContent() {
    if (this.state.mode === 1) {
      return (
        <Form.Field>
          <Input fluid label="Path Width" defaultValue="1" />
          <Input fluid label="Path Height" defaultValue="1" />
        </Form.Field>
      )
    } else if (this.state.mode === 2) {
      return (
        <Form.Field>
          <Input fluid label="Count" defaultValue="10" />
        </Form.Field>
      )
    }
  }

  render() {
    return (
      <Popup
        trigger={
          <Button disabled={this.props.isPlaying} id="mgbjr-MapTools-generator" size="small" icon>
            Generator
          </Button>
        }
        on="click"
        position="bottom left"
        basic
      >
        <Form loading={this.state.isLoading}>
          <Form.Field>
            <Radio
              label="Maze"
              title="Fills the map with a generated maze. Odd-numbered dimensions are required to fill the whole map."
              checked={this.state.mode === 1}
              onClick={(e, data) => {
                this.handleRadioClick(data)
              }}
            />
          </Form.Field>
          <Button compact onClick={this.handleGenerate}>
            Generate
          </Button>
          <Button compact title="create a new generation" onClick={this.handleReseed}>
            New Seed
          </Button>
        </Form>
      </Popup>
    )
  }
}
