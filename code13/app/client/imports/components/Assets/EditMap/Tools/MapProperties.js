import React from 'react'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import {Accordion, Segment, Divider, Label} from 'semantic-ui-react'
import validate from '/imports/schemas/validate'

// MOVE to validate ???
const validateInteger = numLike => {
  const numParsed = parseInt(numLike, 10)
  return !Number.isNaN(numParsed) && Number.isFinite(numParsed)
}
const validateNumber = numLike => {
  const numParsed = parseFloat(numLike)
  return !Number.isNaN(numParsed) && Number.isFinite(numParsed)
}
const validateUInt = numLike => {
  const numParsed = parseInt(numLike, 10)
  return !Number.isNaN(numParsed) && Number.isFinite(numParsed) && numParsed >= 0
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

const layerProperties = ({name, width, height, x, y, type}, onChangeLayer) => ({
  title: name + " properties",
  content: (
    <Segment.Group>
      {type === 'tilelayer' &&
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
      }
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

const tilesetProperties = ({name, tilewidth, tileheight, margin, spacing}, onChangeTilesetName, onChangeTileset) => ({
  title:  name + " properties",
  content: (
    <Segment.Group>
      <Segment>
        <Label pointing='right'>Name:</Label>
        <InlineEdit
          change={onChangeTilesetName} text={name + ''} paramName="name"
          validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
        />
      </Segment>

      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>TileWidth:</Label>
          <InlineEdit
            change={onChangeTileset} text={tilewidth + ''} paramName="tilewidth"
            validate={validateGreaterThanZero}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>TileHeight:</Label>
          <InlineEdit
            change={onChangeTileset} text={tileheight + ''} paramName="tileheight"
            validate={validateGreaterThanZero}
          />
        </Segment>
      </Segment.Group>

      <Segment.Group horizontal>
        <Segment compact>
          <Label pointing='right'>Margin:</Label>
          <InlineEdit
            change={onChangeTileset} text={margin + ''} paramName="margin"
            validate={validateUInt}
          />
        </Segment>
        <Segment compact>
          <Label pointing='right'>Spacing:</Label>
          <InlineEdit
            change={onChangeTileset} text={spacing + ''} paramName="spacing"
            validate={validateUInt}
          />
        </Segment>
      </Segment.Group>
    </Segment.Group>
  )
})

const objectProperties = ({width, height, x, y, name, type, visible, rotation}, changeString, changeNumber) => ({
  title:  name + " properties",
  content: (
    <Segment.Group>
      <Segment>
        <Label pointing='right'>Name:</Label>
        <InlineEdit
          change={changeString} text={name + ''} paramName="name"
          validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
        />
      </Segment>

      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>width:</Label>
          <InlineEdit
            change={changeNumber} text={width + ''} paramName="width"
            validate={validateNumber}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>height:</Label>
          <InlineEdit
            change={changeNumber} text={height + ''} paramName="height"
            validate={validateNumber}
          />
        </Segment>
      </Segment.Group>

      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>x:</Label>
          <InlineEdit
            change={changeNumber} text={x + ''} paramName="x"
            validate={validateNumber}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>y:</Label>
          <InlineEdit
            change={changeNumber} text={y + ''} paramName="y"
            validate={validateNumber}
          />
        </Segment>
      </Segment.Group>

      <Segment.Group horizontal>
        <Segment>
          <Label pointing='right'>rotation:</Label>
          <InlineEdit
            change={changeNumber} text={rotation + ''} paramName="rotation"
            validate={validateInteger}
          />
        </Segment>
        <Segment>
          <Label pointing='right'>type:</Label>
          <InlineEdit
            change={changeNumber} text={type + ''} paramName="type"
            validate={val => validate.lengthCap(val, 255)}
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

  onChangeTilesetName = changes => {
    this.props.tileset.name = changes.name
    this.props.updateTileset(this.props.tileset)
  }
  onChangeTileset = changes => {
    for(let i in changes){
      this.props.tileset[i] = parseInt(changes[i], 10)
    }
    this.props.updateTileset(this.props.tileset)
  }

  onChangeObjectStringValue = changes => {
    const object = this.props.getActiveObject()
    for(let i in changes){
      object[i] = changes[i]
    }
    this.props.updateObject(object)
  }
  onChangeObjectNumbericValue = changes => {
    const object = this.props.getActiveObject()
    for(let i in changes){
      object[i] = parseFloat(changes[i])
    }
    this.props.updateObject(object)
  }


  render() {
    const panels = [
      mapProperties(this.props.map, this.onChangeMapSize, this.onChangeMapTileSize),
      layerProperties(this.props.layer, this.onChangeLayer),
      tilesetProperties(this.props.tileset, this.onChangeTilesetName, this.onChangeTileset),
    ]
    const object = this.props.getActiveObject()
    if(object)
      panels.push(
        objectProperties(object, this.onChangeObjectStringValue, this.onChangeObjectNumbericValue)
      )

    return <Accordion panels={panels} styled/>
  }
}
