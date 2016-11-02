import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'

export default class All extends BaseForm {

  get data() {
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    return (
      <div className="ui form">
        {this.bool("Can this be destroyed/damaged", "destroyableYN")}
        {this.text("Points scored (or lost) when shot by player", "scoreOrLosePointsWhenShotByPlayerNum", "number", {
          disabled: this.data.destroyableYN == "0"
        })}
        {this.text("Points scored (or lost) when killed by player", "scoreOrLosePointsWhenKilledByPlayerNum", "number", {
          disabled: this.data.destroyableYN == "0"
        })}
        {this.dropArea("Drops (creates) new actor when destroyed", "dropsObjectWhenKilledName", "actor", {
          disabled: this.data.destroyableYN == "0"
        })}
        {this.data.dropsObjectWhenKilledName &&
          this.text("% Chance of drop happening", "dropsObjectWhenKilledChance", "number", {
            min: 1, max: 100,
            disabled: this.data.destroyableYN == "0"
          })
        }

        {this.dropArea("Drops (creates) new actor #2 when destroyed", "dropsObjectWhenKilledName2", "actor", {
          disabled: this.data.destroyableYN == "0"
        })}
        {this.data.dropsObjectWhenKilledName2 &&
          this.text("% Chance of drop #2 happening", "dropsObjectWhenKilledChance2", "number", {
            min: 1, max: 100,
            title: "This % chance is independent of drop #1 - so if both are 100% then there will always be two actors dropped. The first dropped item will be in the top-left corner of where the destroyed actor was. The 2nd drop, if it happens will be next to where the destroyed actor was, placed based on the direction the destroyed actor had been facing",
            disabled: this.data.destroyableYN == "0"
          })
        }

        {this.options("Respawn options", "respawnOption", 
          [
            { text: "Respawn on map reload", value: "0" },
            { text: "Never respawn", value: "0" }
          ],
          {
            disabled: this.data.destroyableYN == "0"
          }
        )}

        {this.dropArea("Randomly generates new actor", "dropsObjectRandomlyName", "actor", {
          disabled: this.data.destroyableYN == "0"
        })}

        {this.data.dropsObjectRandomlyName &&
          this.text("% chance of randomly generating actor", "dropsObjectRandomlyChance", "number", {
            min: 1, max: 100,
            title: "% chance of randomly generating actor '"+this.data.dropsObjectRandomlyName+"' each second",
            disabled: this.data.destroyableYN == "0"
          })
        }

      </div>
    )
  }
}
