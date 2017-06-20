import React from 'react'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import {Accordion, Segment, Divider, Label} from 'semantic-ui-react'

const validateInteger = numLike => {
  const numParsed = parseInt(numLike, 10)
  return !Number.isNaN(numParsed) && Number.isFinite(numParsed)
}

const validateGreaterThanZero = numLike => {
  const numParsed = parseInt(numLike, 10)
  return validateInteger(numParsed) && numParsed > 0
}

const mapProperties = ({width, height, tilewidth, tileheight}, changeSize, changeTile) => {
  return {
    title: "Map Properties",
    content: (
      <Segment.Group>
        <Segment.Group horizontal>
          <Segment>
            <Label pointing='right'>Width:</Label>
            <InlineEdit
              change={changeSize} text={width + ''} paramName="width"
              validate={validateGreaterThanZero}
            />
          </Segment>
          <Segment>
            <Label pointing='right'>Height:</Label>
            <InlineEdit
              change={changeSize} text={height + ''} paramName="height"
              validate={validateGreaterThanZero}
            />
          </Segment>
        </Segment.Group>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing='right'>TileWidth:</Label>
            <InlineEdit
              change={changeTile} text={tilewidth + ''} paramName="tilewidth"
              validate={validateGreaterThanZero}
            />
          </Segment>
          <Segment>
            <Label pointing='right'>TileHeight:</Label>
            <InlineEdit
              change={changeTile} text={tileheight + ''} paramName="tileheight"
              validate={validateGreaterThanZero}
            />
          </Segment>
        </Segment.Group>

      </Segment.Group>
    )
  }
}

const layerProperties = ({name, width, height, x, y}, onChangeLayer) => ({
  title: <span>{name}properties</span>,
  content: (
    <Segment.Group>
      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>Width:</Label>
          <InlineEdit
            change={onChangeLayer} text={width + ''} paramName="width"
            validate={validateGreaterThanZero}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>Height:</Label>
          <InlineEdit
            change={onChangeLayer} text={height + ''} paramName="height"
            validate={validateGreaterThanZero}
          />
        </Segment>
      </Segment.Group>

      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>Offset x:</Label>
          <InlineEdit
            change={onChangeLayer} text={x + ''} paramName="x"
            validate={validateInteger}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>Offset y:</Label>
          <InlineEdit
            change={onChangeLayer} text={y + ''} paramName="y"
            validate={validateInteger}
          />
        </Segment>
      </Segment.Group>
    </Segment.Group>
  )
})

export default class extends React.Component {
  constructor(...p) {
    super(...p)
  }

  onChangeMapSize = (changes) => {
    const width = (changes.width ? parseInt(changes.width, 10) : this.props.map.width) || 1
    const height = (changes.height ? parseInt(changes.height, 10) : this.props.map.height) || 1

    this.props.resize({width, height})
  }
  onChangeMapTileSize = (changes) => {
    const tilewidth = (changes.tilewidth ? parseInt(changes.tilewidth, 10) : this.props.map.tilewidth) || 1
    const tileheight = (changes.tileheight ? parseInt(changes.tileheight, 10) : this.props.map.tileheight) || 1

    this.props.changeTileSize({tilewidth, tileheight})
  }

  onChangeLayer = changes => {
    for(let i in changes){
      this.props.layer[i] = parseInt(changes[i], 10)
    }
    this.props.updateLayer(this.props.layer)
  }

  onChangeTileset = changes => {
    for(let i in changes){
      this.props.layer[i] = parseInt(changes[i], 10)
    }
    this.props.updateLayer(this.props.layer)
  }

  render() {
    const panels = [
      mapProperties(this.props.map, this.onChangeMapSize, this.onChangeMapTileSize),
      layerProperties(this.props.layer, this.onChangeLayer),
      tilesetProperties(this.props.tileset, this.onChangeTileset)
    ]
    return <Accordion panels={panels} styled/>
  }
}
