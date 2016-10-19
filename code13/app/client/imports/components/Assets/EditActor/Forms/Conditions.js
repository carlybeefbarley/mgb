import React from 'react'

import BaseForm from '../../../Controls/BaseForm.js'
import { Button, Checkbox, Form, Input, Message, Radio, Select, TextArea } from 'semantic-ui-react'

import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'
import options from '../../Common/ActorOptions.js'

export default class All extends BaseForm {

  get data(){
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    return (
        <div className="ui form">
          <div>'Conditions' make an actor appear or disappear, depending on how many other actors are on the map.</div>
          <div className="allInline">
            {this.options("", "appearIf", options.appearIf)}
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
