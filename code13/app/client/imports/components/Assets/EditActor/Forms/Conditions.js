import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'
import actorOptions from '../../Common/ActorOptions.js'

export default class All extends BaseForm {

  get data() {
    return this.props.asset.content2.databag.itemOrNPC
  }

  render() {
    return (
      <div className="ui form">
        <span>'Conditions' make an actor appear or disappear, depending on how many other actors are on the map.</span>
        <div style={{height: '50vh'}} className="allInline">
          { this.options("", "appearIf", actorOptions.appearIf) }
          { this.data.appearIf != "0" &&
            <span>if</span>
          }
          { this.data.appearIf != "0" &&
            this.text("", "appearCount", "number")
          }
          { this.data.appearIf != "0" &&
            this.dropArea("", "conditionsActor", "actor")
          }
          { this.data.appearIf != "0" &&
            <span>actors are on current map</span>
          }
        </div>
      </div>
    )
  }
}