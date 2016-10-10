import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Checkbox, Form, Input, Message, Radio, Select, TextArea, Table } from 'semantic-ui-react'

import SmallDD from '../components/SmallDD'
import DropArea from '../components/DropArea.js'

const effects = [
  {text: "no effect", value: "no effect"},
  {text: 'rotate90', value: 'rotate90'},
  {text: 'rotate180', value: 'rotate180'},
  {text: 'rotate270', value: 'rotate270'},
  {text: 'flipX', value: 'flipX'},
  {text: 'flipY', value: 'flipY'}
]

const anims = [
  "face north",
  "step north 1",
  "step north 2",
  "step north 3",
  "step north 4",
  
  "face east",
  "step east 1",
  "step east 2",
  "step east 3",
  "step east 4",

  "face south",
  "step south 1",
  "step south 2",
  "step south 3",
  "step south 4",

  "face west",
  "step west 1",
  "step west 2",
  "step west 3",
  "step west 4",
  
  "stationary 1",
  "stationary 2",
  "stationary 3",
  "stationary 4",
  "stationary 5",
  "stationary 6",
  "stationary 7",
  "stationary 8",
  "stationary 9",
  "stationary 10",
  "stationary 11",
  "stationary 12",
  "stationary 13",
  "stationary 14",
  "stationary 15",
  
  "melee north 1",
  "melee north 2",
  "melee north 3",
  "melee north 4",
  "melee north 5",
  "melee north 6",
  "melee north 7",
  "melee north 8",

  "melee east 1",
  "melee east 2",
  "melee east 3",
  "melee east 4",
  "melee east 5",
  "melee east 6",
  "melee east 7",
  "melee east 8",

  "melee south 1",
  "melee south 2",
  "melee south 3",
  "melee south 4",
  "melee south 5",
  "melee south 6",
  "melee south 7",
  "melee south 8",

  "melee west 1",
  "melee west 2",
  "melee west 3",
  "melee west 4",
  "melee west 5",
  "melee west 6",
  "melee west 7",
  "melee west 8",

  "stationary north 1",
  "stationary north 2",
  "stationary north 3",
  "stationary north 4",
  "stationary north 5",
  "stationary north 6",
  "stationary north 7",
  "stationary north 8",
  "stationary north 9",
  "stationary north 10",
  "stationary north 11",
  "stationary north 12",
  "stationary north 13",
  "stationary north 14",
  "stationary north 15",
  "stationary north 16",

  "stationary east 1",
  "stationary east 2",
  "stationary east 3",
  "stationary east 4",
  "stationary east 5",
  "stationary east 6",
  "stationary east 7",
  "stationary east 8",
  "stationary east 9",
  "stationary east 10",
  "stationary east 11",
  "stationary east 12",
  "stationary east 13",
  "stationary east 14",
  "stationary east 15",
  "stationary east 16",

  "stationary south 1",
  "stationary south 2",
  "stationary south 3",
  "stationary south 4",
  "stationary south 5",
  "stationary south 6",
  "stationary south 7",
  "stationary south 8",
  "stationary south 9",
  "stationary south 10",
  "stationary south 11",
  "stationary south 12",
  "stationary south 13",
  "stationary south 14",
  "stationary south 15",
  "stationary south 16",

  "stationary west 1",
  "stationary west 2",
  "stationary west 3",
  "stationary west 4",
  "stationary west 5",
  "stationary west 6",
  "stationary west 7",
  "stationary west 8",
  "stationary west 9",
  "stationary west 10",
  "stationary west 11",
  "stationary west 12",
  "stationary west 13",
  "stationary west 14",
  "stationary west 15",
  "stationary west 16",
  
  
]

export default class Animations extends React.Component {
  state = { serializedForm: {} }
  get data(){
    return this.props.asset.content2.animationTable
  }
  componentDidMount(){
    //$('.ui.dropdown', ReactDOM.findDOMNode(this)).dropdown();
  }

  handleChange = (e, { value }) => this.setState({ value })

  handleSubmit = (e, serializedForm) => {
    e.preventDefault()
    this.setState({ serializedForm })
  }

  onChange = (e) => {
    console.log("Form has changed")
  }

  changeGraphic(index, val){
    this.data[index].tileName = val;
    this.props.onchange && this.props.onchange()
  }
  changeEffect(index, val){
    this.data[index].effect = val;
    this.forceUpdate()
    this.props.onchange && this.props.onchange()
  }
  render() {
    const rows = []
    const d = this.data;
    for(let i=0; i<anims.length; i++){
      if(!this.data[i]){
        this.data[i] = {
          "action": anims[i],
          "tileName": null,
          "effect": "no effect"}
      }
      rows.push(
        <Table.Row key={i}>
          <Table.Cell>{anims[i]}</Table.Cell>
          <Table.Cell>
            <DropArea kind="graphic" value={this.data[i].tileName} effect={this.data[i].effect} asset={this.props.asset} onChange={this.changeGraphic.bind(this, i)}/>
          </Table.Cell>
          <Table.Cell>
            <SmallDD options={effects} value={this.data[i].effect} onchange={this.changeEffect.bind(this, i)} />
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
