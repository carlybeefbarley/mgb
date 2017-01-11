import React from 'react'
import { Table } from 'semantic-ui-react'

import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

export default class Animations extends React.Component {
  state = { serializedForm: {} }
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

  changeGraphic(index, val) {
    this.data[index].tileName = val
    this.props.onChange && this.props.onChange()
  }

  changeEffect(index, val) {
    this.data[index].effect = val
    this.forceUpdate()
    this.props.onChange && this.props.onChange()
  }

  render() {
    const rows = []
    for (let i=0; i<MgbActor.animationNames.length; i++) {
      if (!this.data[i]) {
        this.data[i] = {
          "action": MgbActor.animationNames[i],
          "tileName": null,
          "effect": "no effect" }
      }
      rows.push(
        <Table.Row key={i}>
          <Table.Cell>{MgbActor.animationNames[i]}</Table.Cell>
          <Table.Cell>
            <DropArea kind="graphic" value={this.data[i].tileName} effect={this.data[i].effect} asset={this.props.asset} onChange={this.changeGraphic.bind(this, i)}/>
          </Table.Cell>
          <Table.Cell>
            <SmallDD options={MgbActor.animationEffectNames} value={this.data[i].effect} onChange={this.changeEffect.bind(this, i)} />
          </Table.Cell>
        </Table.Row>
      )
    }

    return (
      <Table celled compact definition>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell>Action</Table.HeaderCell>
            <Table.HeaderCell>Graphic</Table.HeaderCell>
            <Table.HeaderCell>Effect</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    )
  }
}
