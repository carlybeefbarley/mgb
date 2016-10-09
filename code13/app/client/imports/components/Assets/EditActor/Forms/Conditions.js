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
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    return (
        <div className="ui form">
          <div>'Conditions' make an actor appear or disappear, depending on how many other actors are on the map.</div>
          <div className="allInline">
            {this.options("", "appearIf", [
              {text: "No condition", value: "0"},
              {text: "Disappear", value: "1"},
              {text: "Appear", value: "2"},
            ])}
            {this.data.appearIf != "0" &&
              <span>if</span>
            }
            {this.data.appearIf != "0" &&
              this.text("", "appearCount", "number")
            }
            {this.data.appearIf != "0" &&
              this.dropArea("", "conditionsActor", "actor")
            }
            {this.data.appearIf != "0" &&
              <span>actors are on current map</span>
            }
            </div>
          </div>
    )
  }
}
