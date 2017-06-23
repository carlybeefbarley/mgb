import _ from 'lodash'
import React from 'react'
import { Table, Accordion, Icon, Dimmer, Loader, Item, Button, Modal, Checkbox } from 'semantic-ui-react'
import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

export default class Animations extends React.Component {

  state = { 
    serializedForm: {}, 
    isLoading: false, // When loading graphic asset tileset info and frames
    showModal: false, // When importing graphic frames
    graphicFrameImports: [], // Data of frames to import; contains name and if frame is selected
    animationIndex: 0 // Starting animation frame being changed
  }

  get data() {
    return this.props.asset.content2.animationTable
  }

  handleChange = (e, { value }) => this.setState({ value })  // TODO: How is this called?

  handleSubmit = (e, serializedForm) => {   // TODO: How is this called?
    e.preventDefault()
    this.setState({ serializedForm })
  }

  handleGraphicFrameSelection(e, data) {
    let frames = this.state.graphicFrameImports
    if (!data.checked)
      frames[data.value].checked = 0
    else
      frames[data.value].checked = 1

    this.setState({graphicFrameImports: frames})
  }

  onChange = (e) => {   // TODO: How is this called?
    console.log("Form has changed")
  }

  /*
  Graphic assets with multiple frames will have " #frameNumber" appended to the name.
  The frames are imported into Animations when a graphic asset with multiple frames is dropped.
  The frame numbers are parsed from the names in Mage.js to display the correct frame.
  The tileset API and MAGE use 0-based indexing. This uses 1-based indexing like the graphic editor.
  */
  
  // Store graphic frames in graphicFrameImports
  getGraphicFrames(data, val) {
    let graphicFrames = []
    for (let i=0; i<data.tilecount; i++) {
      let name = val + ' #' + (i+1)
      let frame = {name: name, checked: 1}
      graphicFrames.push(frame)
    }
    this.setState({graphicFrameImports: graphicFrames})
  }

  // Change graphics based on selected frames from graphicFrameImports
  changeGraphicFrames() {
    let index = this.state.animationIndex
    let frames = this.state.graphicFrameImports
    for (let i=0; i<frames.length; i++) {
      if (frames[i].checked) {
        this.data[index+i] = {
          "action": MgbActor.animationNames[index+i],
          "tileName": frames[i].name,
          "frame": i,
          "effect": "no effect"
        }
      }
      else 
        index--
    }
    this.setState({showModal: false, graphicFrameImports: [], animationIndex: 0})
    this.props.onChange && this.props.onChange()
  }

  changeGraphic(index, val, asset) {
    this.data[index].tileName = val 
    this.data[index].frame = 0
    this.setState({animationIndex: index})

    if (asset) {
      this.setState({isLoading: true})

      $.get('/api/asset/tileset-info/' + asset._id, (data) => {
        if (data.tilecount > 1) {
          this.setState({showModal: true})
          this.getGraphicFrames(data, val)
        }
      })
      .done(() => {
        this.setState({isLoading: false})
      })
    }

    this.props.onChange && this.props.onChange()
  }

  changeEffect(index, val) {
    this.data[index].effect = val
    this.forceUpdate()
    this.props.onChange && this.props.onChange()
  }
  
  renderContent(animations, i) {
    return (
      <Table.Row style={!this.props.canEdit ? {pointerEvents: 'none'} : {}} key={i}>
        <Table.Cell>{animations[i]}</Table.Cell>
        <Table.Cell>
          <DropArea 
            kind="graphic" 
            value={this.data[i].tileName}
            frame={this.data[i].frame} 
            effect={this.data[i].effect} 
            asset={this.props.asset}
            isLoading={this.state.isLoading}
            onChange={this.changeGraphic.bind(this, i)}
          />
        </Table.Cell>
        <Table.Cell style={{overflow: 'visible'}}>
          <SmallDD options={MgbActor.animationEffectNames} value={this.data[i].effect} onChange={this.changeEffect.bind(this, i)} />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderAccordion(animTable, prevTitle, i) {
    return (
      <div key={i}>
        {
          prevTitle === 'stationary'
          ?
          <Accordion exclusive={false} defaultActiveIndex={0} styled fluid>
            <Accordion.Title active={true}>
              {prevTitle}
            </Accordion.Title>
            <Accordion.Content active={true}>
              <Table fixed celled compact definition>
                <Table.Header fullWidth>
                  <Table.Row>
                    <Table.HeaderCell>Animation Frame</Table.HeaderCell>
                    <Table.HeaderCell width={8}>Graphic</Table.HeaderCell>
                    <Table.HeaderCell>Orientation</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {_.map(animTable, content => { return content })}
                </Table.Body>
              </Table>
            </Accordion.Content>
          </Accordion>
          :
          <Accordion exclusive={false} defaultActiveIndex={0} styled fluid>
            <Accordion.Title>
              <Icon name='dropdown' />
              {prevTitle}
            </Accordion.Title>
            <Accordion.Content>
              <Table fixed celled compact definition>
                <Table.Header fullWidth>
                  <Table.Row>
                    <Table.HeaderCell>Animation Frame</Table.HeaderCell>
                    <Table.HeaderCell width={8}>Graphic</Table.HeaderCell>
                    <Table.HeaderCell>Orientation</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {_.map(animTable, content => { return content })}
                </Table.Body>
              </Table>
            </Accordion.Content>
          </Accordion>
        }
      </div>
    )
  }

  render() {
    let checkedCount = this.state.graphicFrameImports.length

    // Animation accordions
    const aType = this.props.asset.content2.databag.all.actorType
    const animations = MgbActor.animationNames
    const rows = []
    let animTable = [] 
    let prevDirection = animations[0].split(' ')[1]
    let name = animations[0]
    let prevTitle = _.startsWith(name, 'face') ? 'move ' + name.split(' ')[1] : (name.split(' ').length > 2 ? name.split(' ')[0] + ' ' + name.split(' ')[1] : name.split(' ')[0])

    for (let i=0; i<animations.length; i++) {
      name = animations[i]
      if (!this.data[i]) {
        this.data[i] = {
          "action": name,
          "tileName": null,
          "frame": 0,
          "effect": "no effect",
        }
      }

      if (
        !((aType === '0' || aType === '1') && (_.startsWith(name, 'stationary') && name.split(' ').length === 2)) && // Filter out stationary for Player/NPC
        !(aType === '3' && (_.startsWith(name, 'stationary') || _.startsWith(name, 'melee'))) && // Filter out non-movement for Shot
        !(['2', '4', '5', '6', '7'].indexOf(aType) > -1 && (!_.startsWith(name, 'stationary') || name.split(' ').length !== 2)) // Filter out non-stationary for Item/Wall/Floor/Scenery
      ) {
        // Group animations by direction 
        if (
          (['2', '4', '5', '6', '7'].indexOf(aType) === -1 && name.includes(prevDirection)) || 
          (['2', '4', '5', '6', '7'].indexOf(aType) > -1  && _.startsWith(name, 'stationary') && name.split(' ').length === 2) || // Don't use prevDirection if only stationary animations
          i+1 === animations.length
        ) {
          animTable.push(this.renderContent(animations, i)) 
          // Fencepost
          if (i+1 === animations.length) {
            rows.push(this.renderAccordion(animTable, prevTitle, i))
          }
        } 
        // Put animation group for current direction in accordion
        else 
        {
          if (animTable.length > 0)
            rows.push(this.renderAccordion(animTable, prevTitle, i))

          // Content for next direction
          prevDirection = name.split(' ')[1] // get direction from animation name which is the 2nd part of string (action direction frameNum)
          prevTitle = _.startsWith(name, 'face') ? 'move ' + name.split(' ')[1] : (name.split(' ').length > 2 ? name.split(' ')[0] + ' ' + name.split(' ')[1] : name.split(' ')[0])
          animTable = []
          
          animTable.push(this.renderContent(animations, i)) 
        }
      }
      else if (animTable.length > 0) {
        if (['2', '4', '5', '6', '7'].indexOf(aType) > -1)
          rows.push(this.renderAccordion(animTable, 'stationary', i))
        else 
          rows.push(this.renderAccordion(animTable, prevTitle, i))

        animTable = []
      }
    } 

    return (
      <div style={{position: 'relative'}}>
        {
          this.state.isLoading && 
          <Dimmer active inverted>
            <Loader style={{position: 'fixed', right: '345px', top: '50%', translate: "transform(-50%, -50%)"}} active inline size='large'>Loading frames...</Loader>
          </Dimmer>
        }
        {
          this.state.showModal && 
          <Modal defaultOpen
            size="small" 
            onUnmount={() => {this.setState({showModal: false, graphicFrameImports: [], animationIndex: 0})}} 
          >
            <Modal.Header>Import Graphic Frames</Modal.Header>
            <Modal.Content>
              <Item.Group divided>
                {
                _.map(this.state.graphicFrameImports, (frame, i) => {
                  if (!frame.checked)
                    checkedCount--

                  return (
                    <Item key={i}>
                      <DropArea
                        kind="graphic" 
                        value={frame.name}
                        frame={i} 
                        asset={this.props.asset}
                        isModalView={true}
                      /> 
                      <Checkbox 
                        name={frame.name} 
                        value={i}
                        style={{position: 'absolute', right: '25px'}} 
                        defaultChecked 
                        onChange={(e, data) => {this.handleGraphicFrameSelection(e, data)}} 
                      />
                    </Item>
                  )}
                  )
                }
              </Item.Group>
            </Modal.Content>
            <Modal.Actions>
              <Button primary 
                disabled={!checkedCount} 
                onClick={() => this.changeGraphicFrames()}>
                Import Selected Frames
              </Button>
            </Modal.Actions>
          </Modal> 
        }
        {
          rows.map((anim) => {
            return anim
          })
        }
      </div>
    )
  }
}

