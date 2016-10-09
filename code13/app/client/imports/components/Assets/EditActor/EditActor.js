import React from 'react'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import './EditActor.css'
//import Forms from './Forms'

import Tabs from './Tabs.js'

import FormsAll from './Forms/All'
import Animations from './Forms/Animations'
import CharacterBehavior from './Forms/CharacterBehavior'

export default class EditActor extends React.Component {
  constructor (...props) {
    super(...props)
    this.state = {}
    window.edit_actor = this
  }

  getUser () {
    return this.props.currUser.profile.name
  }

  doSnapshotActivity () {
    let passiveAction = {
      isActor: true // This could in future have info such as which layer is being edited, but not needed yet
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount () {
    this.doSnapshotActivity()
    console.log(this.props.asset)
    this.fixAsset()

  }

  handleSave (reason, thumbnail) {
    console.log("Saving....")
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  getTabs() {
    return [
      {
        tab: "All",
        content: <FormsAll asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "Animations",
        content: <Animations asset={this.props.asset} onchange={this.handleSave.bind(this)}  />
      },
      {
        tab: "Character Behavior",
        content: <CharacterBehavior asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      }
    ]
  }

  fixAsset(){
    // fix blank asset..
    if(!this.props.asset.content2.databag) {
      debugger;
      console.log("FIXIN broken asset...")
      this.props.asset.content2 = {
        animationTable: [],
        databag: {
          all: {},
          allChar: {},
          item: {},
          itemOrNPC: {},
          npc: {},
          playerCharacter: ""
        }
      }

    }
  }

  render () {
    if (!this.props.asset) {
      return null
    }
    this.fixAsset()
    return (
      <div className='ui grid'>
        <Tabs tabs={this.getTabs()} />
      </div>
    )
  }
}
