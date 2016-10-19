import React from 'react'

import BaseForm from '../../../Controls/BaseForm.js'
import { Button, Checkbox, Form, Input, Message, Radio, Select, TextArea } from 'semantic-ui-react'

import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'

import options from '../../Common/ActorOptions.js'

import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

export default class All extends BaseForm {

  get data(){
    return this.props.asset.content2.databag.all
  }

  render() {

    if(!this.soundOptions){
      this.soundOptions = []
      const s = MgbActor.alCannedSoundsList
      for(let i=0; i<s.length; i++){
        this.soundOptions.push({
          text: s[i],
          value: s[i]
        })
      }
    }
    return (
        <div className="ui form">
          {this.options("Actor Type", 'actorType', options.actorType)}
          {this.text("Description", 'description')}
          {this.text("Initial Heath", 'initialHealthNum', "number", {min: 1} )}
          {this.text("Initial Max Health", 'initialMaxHealthNum', "number", {
            min: 0,
            max: 10000,
            title: "This is the highest health the actor can have. the value 0 means there is no limit"
          } )}

          {this.dropArea("Sound When Harmed", 'soundWhenHarmed', "sound" ,{
            options: this.soundOptions
          })}
          {this.dropArea("Sound When Healed", 'soundWhenHealed', "sound", {
            options: this.soundOptions
          })}
          {this.dropArea("Sound When Killed", 'soundWhenKilled', "sound", {
            options: this.soundOptions
          })}

          {this.dropArea("Graphic", "defaultGraphicName", "graphic", null, (asset) => {
            if(asset && asset.thumbnail){
              this.props.saveThumbnail(asset.thumbnail)
            }
          })}
        </div>
    )
  }
}
