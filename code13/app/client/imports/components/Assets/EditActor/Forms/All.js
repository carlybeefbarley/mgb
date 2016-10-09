import React from 'react'

import BaseForm from '../BaseForm.js'
import { Button, Checkbox, Form, Input, Message, Radio, Select, TextArea } from 'semantic-ui-react'

import DropArea from '../components/DropArea.js'
import SmallDD from '../components/SmallDD.js'


const actorTypes = [
  {text: 'Player', value: "0"},
  {text: 'Non-Player Character (NPC)', value: "1"},
  {text: 'Item, Wall or Scenery', value: "2"},
  {text: 'Shot', value: "3"}
]

export default class All extends BaseForm {

  get data(){
    return this.props.asset.content2.dataBag.all
  }

  render() {
    return (
        <div className="ui form">
          {this.options("Actor Type", 'actorType', actorTypes)}
          {this.text("Description", 'description')}
          {this.text("Initial Heath", 'initialHealthNum', "number", {min: "1"} )}
          {this.text("Initial Max Health", 'initialMaxHealthNum', "number", {min: "1"} )}

          {this.dropArea("Sound When Harmed", 'soundWhenHarmed', "sound")}
          {this.dropArea("Sound When Healed", 'soundWhenHealed', "sound")}
          {this.dropArea("Sound When Killed", 'soundWhenKilled', "sound")}

          {this.dropArea("Graphic", "defaultGraphicName", "graphic", null, (asset) => {
            this.props.saveThumbnail(asset.thumbnail)
          })}
        </div>
    )
  }
}
