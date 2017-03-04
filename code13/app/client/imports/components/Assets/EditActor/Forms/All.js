import _ from 'lodash'
import React from 'react'

import BaseForm from '../../../Controls/BaseForm.js'
import actorOptions from '../../Common/ActorOptions.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'


export default class All extends BaseForm {

  get data() {
    return this.props.asset.content2.databag.all
  }

  render() {
    const soundOptions = { options: MgbActor.alCannedSoundsList.map( s => ( { text: '[builtin]:'+s, value: '[builtin]:'+s } ) ) }
    // Handle limiting InitialHealth < initialMaxHealthNum
    let initHealthConfig = { min: 1 }
    if (this.data.initialMaxHealthNum)
    {
      const max = parseInt(this.data.initialMaxHealthNum, 10)
      if (max > 0)
        initHealthConfig.max = max
    }
    const databag = this.props.asset.content2.databag

    return (
    <div className="ui form">
          {this.options(
            "Actor Type", 
            'actorType', 
            _.pickBy(actorOptions.actorType, (val, key) => {return key !== 'Item, Wall, or Scenery'}),
            {},
            "mgbjr-edit-actor-actorType",
            "mgbjr-CT-edit-actor-actorType",
            () => { 
              // Set correct itemActivationType when actorType is changed
              switch(parseInt(databag.all.actorType)) {
                case 4:
                  databag.item.itemActivationType = databag.item.itemActivationType !== '0' ? '0' : databag.item.itemActivationType
                  break
                case 5:
                  databag.item.itemActivationType = ['4', '5', '6', '7'].indexOf(databag.item.itemActivationType) === -1 ? '4' : databag.item.itemActivationType
                  break
                case 6:
                  databag.item.itemActivationType = ['1', '2', '3'].indexOf(databag.item.itemActivationType) === -1 ? '3' : databag.item.itemActivationType
                  break
                case 7:
                  databag.item.itemActivationType = ['0', '8', '9'].indexOf(databag.item.itemActivationType) === -1 ? '0' : databag.item.itemActivationType
              }
            }
          )}
          {this.text("Description", 'description')}
          {this.text("Initial Heath", 'initialHealthNum', "number", initHealthConfig )}
          {this.text("Initial Max Health", 'initialMaxHealthNum', "number", {
            min: 0,
            max: 10000,
            title: "This is the highest health the actor can have. The value 0 means there is no limit"
          } )}

          {this.dropArea("Sound When Harmed", 'soundWhenHarmed', "sound", soundOptions)}
          {this.dropArea("Sound When Healed", 'soundWhenHealed', "sound", soundOptions)}
          {this.dropArea("Sound When Killed", 'soundWhenKilled', "sound", soundOptions)}

          {this.dropArea("Graphic", "defaultGraphicName", "graphic", null, (asset) => {
            if(asset) {
              const canvas = document.createElement("canvas")
              const ctx = canvas.getContext("2d")
              const img = new Image
              img.crossOrigin = "anonymous"
              img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                this.props.saveThumbnail(canvas.toDataURL())
              }
              img.onerror = (e) => {
                console.error("Failed to update Actor image", e)
              }
              img.src = Thumbnail.getLink(asset)
            }
          })}
        </div>
    )
  }
}
