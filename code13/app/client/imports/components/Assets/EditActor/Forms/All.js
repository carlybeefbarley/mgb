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
    return this.props.asset.content2.databag.all
  }

  render() {
    return (
        <div className="ui form">
          {this.options("Actor Type", 'actorType', actorTypes)}
          {this.text("Description", 'description')}
          {this.text("Initial Heath", 'initialHealthNum', "number", {min: 1} )}
          {this.text("Initial Max Health", 'initialMaxHealthNum', "number", {
            min: 0,
            max: 10000,
            title: "This is the highest health the actor can have. the value 0 means there is no limit"
          } )}
          {/*
           <mx:FormItem label="Affected by gravity:" toolTip="{notYet}" visible="false" includeInLayout="false">
           <mx:ComboBox dataProvider="{MgbActor.alNoYes}" selectedIndex="{actorPiece.actorXML.databag.all.gravityYN}" id="ui_all_gravityYN" editable="false"/>
           </mx:FormItem>

           <mx:FormItem label="Visual effect when harmed:" id="fi_all_harmEffect" toolTip="{notYet}" visible="false" includeInLayout="false">
           <mx:ComboBox dataProvider="{MgbActor.alVisualEffect}" selectedIndex="{actorPiece.actorXML.databag.all.visualEffectWhenHarmedType}" id="ui_all_visualEffectWhenHarmedType" editable="false"/>
           </mx:FormItem>

           <mx:FormItem label="Visual effect when healed:" id="fi_all_healEffect" toolTip="{notYet}" visible="false" includeInLayout="false">
           <mx:ComboBox dataProvider="{MgbActor.alVisualEffect}" selectedIndex="{actorPiece.actorXML.databag.all.visualEffectWhenHealedType}" id="ui_all_visualEffectWhenHealedType" editable="false"/>
           </mx:FormItem>


          */}


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
