import PropTypes from 'prop-types'
import React from 'react'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import { Accordion, Segment, Label, Button, Table } from 'semantic-ui-react'
import validate from '/imports/schemas/validate'

// TODO: replace InlineEdit with something better - editor input like ( e.g. in the blender/photoshop)

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
  return validateInteger(numParsed) && numParsed >= 0
}

const validateGreaterThanZero = numLike => {
  const numParsed = parseInt(numLike, 10)
  return validateInteger(numParsed) && numParsed > 0
}

const mapProperties = ({ width, height, tilewidth, tileheight }, changeSize, changeTile) => ({
  title: 'Map Properties',
  content: {
    key: 'map-properties-content',
    content: (
      <Segment.Group>
        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">Width:</Label>
            <InlineEdit
              change={changeSize}
              text={width + ''}
              paramName="width"
              validate={validateGreaterThanZero}
            />
          </Segment>
          <Segment>
            <Label pointing="right">Height:</Label>
            <InlineEdit
              change={changeSize}
              text={height + ''}
              paramName="height"
              validate={validateGreaterThanZero}
            />
          </Segment>
        </Segment.Group>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">Tile Width:</Label>
            <InlineEdit
              change={changeTile}
              text={tilewidth + ''}
              paramName="tilewidth"
              validate={validateGreaterThanZero}
            />
          </Segment>
          <Segment>
            <Label pointing="right">Tile Height:</Label>
            <InlineEdit
              change={changeTile}
              text={tileheight + ''}
              paramName="tileheight"
              validate={validateGreaterThanZero}
            />
          </Segment>
        </Segment.Group>
      </Segment.Group>
    ),
  },
})

const layerProperties = ({ name, width, height, x, y, type }, onChangeLayer) => ({
  title: name + ' properties',
  content: {
    key: name + '-properties-content',
    content: (
      <Segment.Group>
        {type === 'tilelayer' && (
          <Segment.Group horizontal>
            <Segment>
              <Label pointing="right">Width:</Label>
              <InlineEdit
                change={onChangeLayer}
                text={width + ''}
                paramName="width"
                validate={validateGreaterThanZero}
              />
            </Segment>
            <Segment>
              <Label pointing="right">Height:</Label>
              <InlineEdit
                change={onChangeLayer}
                text={height + ''}
                paramName="height"
                validate={validateGreaterThanZero}
              />
            </Segment>
          </Segment.Group>
        )}
        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">Offset x:</Label>
            <InlineEdit change={onChangeLayer} text={x + ''} paramName="x" validate={validateInteger} />
          </Segment>
          <Segment>
            <Label pointing="right">Offset y:</Label>
            <InlineEdit change={onChangeLayer} text={y + ''} paramName="y" validate={validateInteger} />
          </Segment>
        </Segment.Group>
      </Segment.Group>
    ),
  },
})

const tilesetProperties = (
  { name, tilewidth, tileheight, margin, spacing },
  onChangeTilesetName,
  onChangeTileset,
) => ({
  title: name + ' properties',
  content: {
    key: name + '-properties-content',
    content: (
      <Segment.Group>
        <Segment>
          <Label pointing="right">Name:</Label>
          <InlineEdit
            change={onChangeTilesetName}
            text={name + ''}
            paramName="name"
            validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
          />
        </Segment>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">TileWidth:</Label>
            <InlineEdit
              change={onChangeTileset}
              text={tilewidth + ''}
              paramName="tilewidth"
              validate={validateGreaterThanZero}
            />
          </Segment>
          <Segment>
            <Label pointing="right">TileHeight:</Label>
            <InlineEdit
              change={onChangeTileset}
              text={tileheight + ''}
              paramName="tileheight"
              validate={validateGreaterThanZero}
            />
          </Segment>
        </Segment.Group>

        <Segment.Group horizontal>
          <Segment compact>
            <Label pointing="right">Margin:</Label>
            <InlineEdit
              change={onChangeTileset}
              text={margin + ''}
              paramName="margin"
              validate={validateUInt}
            />
          </Segment>
          <Segment compact>
            <Label pointing="right">Spacing:</Label>
            <InlineEdit
              change={onChangeTileset}
              text={spacing + ''}
              paramName="spacing"
              validate={validateUInt}
            />
          </Segment>
        </Segment.Group>
      </Segment.Group>
    ),
  },
})

// TODO: add / handle property type - e.g. string / number etc
class MoreProperties extends React.Component {
  static propTypes = {
    savedProps: PropTypes.array,
    updateSavedProps: PropTypes.function,
  }

  changeName = (index, changes) => {
    const { savedProps } = this.props
    savedProps[index].name = changes.name
    this.props.updateSavedProps(savedProps)
  }

  changeValue = (index, changes) => {
    const { savedProps } = this.props
    savedProps[index].value = changes.value
    this.props.updateSavedProps(savedProps)
  }

  removeKeyVal = index => {
    this.props.savedProps.splice(index, 1)
    this.props.updateSavedProps(this.props.savedProps)
  }

  render() {
    const { savedProps } = this.props
    const props = savedProps.map((p, index) => (
      <Table.Row horizontal style={{ padding: '0.1em', margin: '0.1em' }} key={index}>
        <Table.Cell style={{ padding: '0.2em 1em' }}>
          <InlineEdit
            change={this.changeName.bind(this, index)}
            text={p.name + ''}
            paramName="name"
            validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
          />
        </Table.Cell>
        <Table.Cell style={{ padding: '0.2em 1em' }}>
          <InlineEdit
            change={this.changeValue.bind(this, index)}
            text={p.value + ''}
            paramName="value"
            validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
          />
        </Table.Cell>
        <Table.Cell style={{ padding: '0.2em 1em' }} textAlign="right">
          <Button size="mini" compact onClick={this.removeKeyVal.bind(this, index)}>
            x
          </Button>
        </Table.Cell>
      </Table.Row>
    ))

    return (
      <Segment>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>{props}</Table.Body>
        </Table>
        <Button
          onClick={() => {
            savedProps.push({ name: 'unnamed', value: 'property' })
            this.props.updateSavedProps(savedProps)
          }}
        >
          Add Property
        </Button>
      </Segment>
    )
  }
}

// mgb_properties - array<name:String, value:String>
// properties - map<name:value> - we are rebuilding properties from mgb_properties
const objectProperties = (
  { width, height, x, y, name, type, visible, rotation, mgb_properties, properties },
  changeString,
  changeNumber,
  updateSavedProps,
) => ({
  title: name + ' properties',
  content: {
    key: name + '-properties-content',
    content: (
      <Segment.Group>
        <Segment>
          <Label pointing="right">Name:</Label>
          <InlineEdit
            change={changeString}
            text={name + ''}
            paramName="name"
            validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
          />
        </Segment>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">width:</Label>
            <InlineEdit change={changeNumber} text={width + ''} paramName="width" validate={validateNumber} />
          </Segment>
          <Segment>
            <Label pointing="right">height:</Label>
            <InlineEdit
              change={changeNumber}
              text={height + ''}
              paramName="height"
              validate={validateNumber}
            />
          </Segment>
        </Segment.Group>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">x:</Label>
            <InlineEdit change={changeNumber} text={x + ''} paramName="x" validate={validateNumber} />
          </Segment>
          <Segment>
            <Label pointing="right">y:</Label>
            <InlineEdit change={changeNumber} text={y + ''} paramName="y" validate={validateNumber} />
          </Segment>
        </Segment.Group>

        <Segment.Group horizontal>
          <Segment>
            <Label pointing="right">rotation:</Label>
            <InlineEdit
              change={changeNumber}
              text={rotation + ''}
              paramName="rotation"
              validate={validateInteger}
            />
          </Segment>
          <Segment>
            <Label pointing="right">type:</Label>
            <InlineEdit
              change={changeNumber}
              text={type + ''}
              paramName="type"
              validate={val => validate.lengthCap(val, 255)}
            />
          </Segment>
        </Segment.Group>

        <MoreProperties
          savedProps={mgb_properties}
          tiledProps={properties}
          updateSavedProps={updateSavedProps}
        />
      </Segment.Group>
    ),
  },
})

export default class extends React.Component {
  static propTypes = {
    map: PropTypes.object, // basic map data: {width, height, tilewidth, tileheight}
    layer: PropTypes.object, // object representing Tiled Layer- http://doc.mapeditor.org/reference/tmx-map-format/#layer - content2.layers[active]
    tileset: PropTypes.object, // object representing Tiled tileset - http://doc.mapeditor.org/reference/tmx-map-format/#tileset - content2.tilesets[active]

    /// check out app/client/imports/components/Assets/Common/Map/Props/PropertiesProps.js - for related methods
  }

  onChangeMapSize = changes => {
    const width = (changes.width ? parseInt(changes.width, 10) : this.props.map.width) || 1
    const height = (changes.height ? parseInt(changes.height, 10) : this.props.map.height) || 1

    this.props.resize({ width, height })
  }

  onChangeMapTileSize = changes => {
    const tilewidth = (changes.tilewidth ? parseInt(changes.tilewidth, 10) : this.props.map.tilewidth) || 1
    const tileheight =
      (changes.tileheight ? parseInt(changes.tileheight, 10) : this.props.map.tileheight) || 1

    this.props.changeTileSize({ tilewidth, tileheight })
  }

  onChangeLayer = changes => {
    for (let i in changes) {
      this.props.layer[i] = parseInt(changes[i], 10)
    }
    this.props.updateLayer(this.props.layer)
  }

  onChangeTilesetName = changes => {
    this.props.tileset.name = changes.name
    this.props.updateTileset(this.props.tileset)
  }

  onChangeTileset = changes => {
    for (let i in changes) {
      this.props.tileset[i] = parseInt(changes[i], 10)
    }
    this.props.updateTileset(this.props.tileset)
  }

  onChangeObjectStringValue = changes => {
    const object = this.props.getActiveObject()
    for (let i in changes) {
      object[i] = changes[i]
    }
    this.props.updateObject(object)
  }

  onChangeObjectNumbericValue = changes => {
    const object = this.props.getActiveObject()
    for (let i in changes) {
      object[i] = parseFloat(changes[i])
    }
    this.props.updateObject(object)
  }

  updateObjectProps = newProps => {
    const object = this.props.getActiveObject()
    object.mgb_properties = newProps
    object.properties = {}
    for (let i = 0; i < newProps.length; i++) {
      const p = newProps[i]
      object.properties[p.name] = p.value
    }
    this.props.updateObject(object)
  }

  render() {
    const { getActiveObject, layer, map, tileset } = this.props
    const panels = []

    if (map) panels.push(mapProperties(map, this.onChangeMapSize, this.onChangeMapTileSize))
    if (layer) panels.push(layerProperties(layer, this.onChangeLayer))
    if (tileset) panels.push(tilesetProperties(tileset, this.onChangeTilesetName, this.onChangeTileset))

    const object = getActiveObject()
    if (object) {
      // TODO - clean up
      if (!object.mgb_properties) object.mgb_properties = []

      panels.push(
        objectProperties(
          object,
          this.onChangeObjectStringValue,
          this.onChangeObjectNumbericValue,
          this.updateObjectProps,
        ),
      )
    }

    return <Accordion panels={panels} styled />
  }
}
