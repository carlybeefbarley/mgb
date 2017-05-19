import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

export default class NPCBehavior extends BaseForm {
  get data() {
    return this.props.asset.content2.databag.npc
  }

  createResponses(num) {
    const responseChoice = "responseChoice" + num;
    const dropsObjectOnChoice = "dropsObjectOnChoice" + num
    const responseChoiceDropPersistsYN = "responseChoice" + num + "DropPersistsYN"
    const takeObjectTypeOnChoice = "takeObjectTypeOnChoice" + num
    const takesObjectOnChoice = "takesObjectOnChoice" + num
    const takesObjectCountOnChoiceNum = "takesObjectCountOnChoice" + num + "Num"
    const saysWhatOnChoice = "saysWhatOnChoice" + num
    const responseChoiceStayYN = "responseChoice"+num+"StayYN"

    return (
      <div>
        <div className="column">
          <div className="ui inline">
            {this.text("Response Option", responseChoice)}
            {this.data[responseChoice] &&
              this.dropArea("Drop", dropsObjectOnChoice, "actor")
            }
            {this.data[responseChoice] && this.data[dropsObjectOnChoice] &&
              this.bool("Drop is persistent?", responseChoiceDropPersistsYN)
            }
          </div>
        </div>
        {this.data[responseChoice] &&
          this.dropArea(
            this.data[takeObjectTypeOnChoice] == "0" ? "NPC takes item" : "NPC requires item",
            takesObjectOnChoice,
            "actor",
            {title: "This option lets the NPC require that the player posesses (or gives) an item to the NPC in order to make this choice. Only the first response has this option."}
          )
        }
        {this.data[responseChoice] && this.data[takesObjectOnChoice] &&
          this.bool("Take or Require?", takeObjectTypeOnChoice)
        }
        {this.data[responseChoice] &&
          this.text("Count", takesObjectCountOnChoiceNum, "number")
        }

        {this.data[responseChoice] &&
          this.text("NPC then says...", saysWhatOnChoice)
        }

        {this.data[responseChoice] &&
          this.options("NPC Stays", responseChoiceStayYN, [
            { text: "Disappears",       value: "0"},
            { text: "Stays",           value: "1"},
            { text: "Repeat Question", value: "2"},
          ])
        }
      </div>
    )
  }

  render() {
    return (
      <div className="ui form">
        <span id="mgbjr-edit-actor-tab-NPCBehavior-movement">
          {this.options("Movement Type", 'movementType', [
            { text: "No automatic movement",  value: "0" },
            { text: "Moves randomly",         value: "1" },
            { text: "Moves towards player",   value: "2" },
            { text: "Moves away from player", value: "3" },
          ], {
            title: "Select the way the NPC will move"
          })}
        </span>
        <span id="mgbjr-edit-actor-tab-NPCBehavior-aggro">
        {this.data.movementType != "2" && this.text("Aggro range", 'aggroRange', "number", {
          title: "If the NPC is with this many tiles of the player, then the NPC will move towards the player"
        })}
        </span>
        <span id="mgbjr-edit-actor-tab-NPCBehavior-occupySpace">
          {this.bool("NPC can occupy player's space", 'canOccupyPlayerSpaceYN')}
        </span>
        <span id="mgbjr-edit-actor-tab-NPCBehavior-shot">
        {this.options("Automatic shot accuracy", 'shotAccuracyType', [
          { text: "Random shot", value: "0" },
          { text: "Poor shot",   value: "1" },
          { text: "Good shot",   value: "2" },
          { text: "Great shot",  value: "3" },
        ])}
        </span>
        <hr />
        <div id="mgbjr-edit-actor-tab-NPCBehavior-dialogue">
          {this.props.asset.content2.databag.itemOrNPC.destroyableYN &&
            <span style={{color: "#A91313"}}>Note: Players can't talk to NPCs that they can do 'touch damage' to</span>
          }

          <span onChange={ () => joyrideCompleteTag(`mgbjr-CT-edit-actor-tab-NPCBehavior-dialogue`)} >
            {this.textArea("Greeting when player meets", 'talkText', {
              title: "When the player walks into this character, show this text in a dialog. This ONLY works if the NPC is placed on the ACTIVE layer of the map",
            })}
          </span>
        
        {this.data.talkText && this.data.talkText.length > 0 && 
        <div>
          {this.options("Font for message", 'talkTextFontIndex', [
            { text: "titlefont",         value: "0"},
            { text: "abscissa",          value: "1"},
            { text: "bradybunch",        value: "2"},
            { text: "geosanlight",       value: "3"},
            { text: "argorpriht",        value: "4"},
            { text: "ellianarellespath", value: "5"},
            { text: "illegaledding",     value: "6"},
          ], {
            title: "Font used for this message"
          })}
          <hr />
          <fieldset id="mgbjr-edit-actor-tab-NPCBehavior-dialogue-option1">
            <legend>Response option #1</legend>
            {this.createResponses(1)}
          </fieldset>
          <fieldset>
            <legend>Response option #2</legend>
            {this.createResponses(2)}
          </fieldset>
          <fieldset>
            <legend>Response option #3</legend>
            {this.createResponses(3)}
          </fieldset>
        </div>
        }
        </div>
      </div>
    )
  }
}