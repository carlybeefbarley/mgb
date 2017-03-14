import _ from 'lodash'
import React from 'react'
import { Table, Accordion, Icon, Dimmer, Loader } from 'semantic-ui-react'

import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

export default class Animations extends React.Component {
  state = { serializedForm: {}, isLoading: false }
  get data() {
    return this.props.asset.content2.animationTable
  }

  handleChange = (e, { value }) => this.setState({ value })  // TODO: How is this called?

  handleSubmit = (e, serializedForm) => {   // TODO: How is this called?
    e.preventDefault()
    this.setState({ serializedForm })
  }

  onChange = (e) => {   // TODO: How is this called?
    console.log("Form has changed")
  }

  changeGraphic(index, val, asset) {
    this.data[index].tileName = val 
    this.data[index].frame = 0

    if (asset) {
      this.setState({isLoading: true})
      $.get('/api/asset/tileset-info/' + asset._id, (data) => {
        if (data.tilecount > 1) {
          this.data[index].tileName = val + '.frame00'
          for (i=1; i<data.tilecount; i++) {
            if (!this.data[index+i].tileName) {
              let name = data.name + (i > 9 ? '.frame' + i : '.frame0' + i)
              this.data[index+i] = {
                "action": MgbActor.animationNames[index+i],
                "tileName": name,
                "frame": i,
                "effect": "no effect"
              }
            }
            else
              break
          }
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
      <Table.Row key={i}>
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
        <Table.Cell>
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
              <Table celled compact definition>
                <Table.Header fullWidth>
                  <Table.Row>
                    <Table.HeaderCell>Animation Frame</Table.HeaderCell>
                    <Table.HeaderCell width={10}>Graphic</Table.HeaderCell>
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
              <Table celled compact definition>
                <Table.Header fullWidth>
                  <Table.Row>
                    <Table.HeaderCell>Animation Frame</Table.HeaderCell>
                    <Table.HeaderCell width={10}>Graphic</Table.HeaderCell>
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
    const aType = this.props.asset.content2.databag.all.actorType
    const animations = MgbActor.animationNames
    const rows = []
    let animTable = [] 
    let prevDirection = animations[0].split(' ')[1]
    let name = animations[0]
    let prevTitle = _.startsWith(name, 'face') ? 'move ' + name.split(' ')[1] : (name.split(' ').length > 2 ? name.split(' ')[0] + ' ' + name.split(' ')[1] : name.split(' ')[0])
    let curr = 0

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
          <Dimmer inverted>
            <Loader style={{position: 'fixed', top: '50%', translate: "transform(-75%, -50%)"}} inline size='large'>Loading</Loader>
          </Dimmer>
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

