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
          {this.bool("Can this be destroyed/damaged", "destroyableYN")}
          {this.text("Points scored (or lost) when shot by player", "scoreOrLosePointsWhenShotByPlayerNum", "number", {

          })}
          {this.text("Points scored (or lost) when killed by player", "scoreOrLosePointsWhenKilledByPlayerNum", "number", {

          })}
          {this.dropArea("Drops (creates) new actor when destroyed", "dropsObjectWhenKilledName", "actor")}
          {this.data.dropsObjectWhenKilledName &&
            this.text("% Chance of drop happening", "dropsObjectWhenKilledChance", "number", {
              min: 1, max: 100
            })
          }

          {this.dropArea("Drops (creates) new actor #2 when destroyed", "dropsObjectWhenKilledName2", "actor")}
          {this.data.dropsObjectWhenKilledName2 &&
            this.text("% Chance of drop #2 happening", "dropsObjectWhenKilledChance2", "number", {
              min: 1, max: 100,
              title: "This % chance is independent of drop #1 - so if both are 100% then there will always be two actors dropped. The first dropped item will be in the top-left corner of where the destroyed actor was. The 2nd drop, if it happens will be next to where the destroyed actor was, placed based on the direction the destroyed actor had been facing"
            })
          }

          {this.bool("Respawn options", "respawnOption")}

          {this.dropArea("Randomly generates new actor", "dropsObjectRandomlyName", "actor")}
          {this.data.dropsObjectRandomlyName &&
          this.text("% chance of randomly generating actor", "dropsObjectRandomlyChance", "number", {
            min: 1, max: 100,
            title: "% chance of randomly generating actor '"+this.data.dropsObjectRandomlyName+"' each second"
          })
          }

        </div>
    )
  }
}
