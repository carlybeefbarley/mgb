import _ from 'lodash'
import React, { PropTypes } from 'react'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'


import MapArea from './ActorMap.js'
import InfoTool from '../Common/Map/Tools/InfoTool.js'

import PlayForm from "./Modals/PlayForm.js"
import MusicForm from "./Modals/MusicForm.js"

export default class EditMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tools: {}
    }
    this.jumpData = {
      map: '',
      x: 0,
      y: 0
    }
    this.musicData = {
      music: ''
    }
  }

  getUser () {
    return this.props.currUser.profile.name
  }

  /* This stores a short-term record indicating this user is viewing this Map
   * It provides the data for the 'just now' part of the history navigation and also 
   * the 'viewers' indicator. It helps users know other people are looking at some asset
   * right now
   */
  doSnapshotActivity () {
    let passiveAction = {
      isMap: true // This could in future have info such as which layer is being edited, but not needed yet
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount () {
    this.doSnapshotActivity()
  }

  handleOnChange (updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString }
    this.props.handleContentChange(newC2, ''); // TODO: Thumbnail is second param
  }

  handleSave (data, reason, thumbnail) {
    if(!this.props.canEdit){
      console.error("Read only map")
      return
    }
    // TODO: convert uploaded images to assets
    this.props.handleContentChange(data, thumbnail, reason)
  }
  // action can be jump or music
  showModal(action, cb){

    //this.setState({modal: cb})
    $(this.refs[action]).modal(
      {
        size: "small",
        detachable: false,
        context: this.refs.container,
        onApprove: () => {
          console.log("Approve", this[action+"Data"])
          cb(this[action+"Data"])
        }
      }).modal("show")
  }
  renderPlayModal(){
    return (
      <div className="ui modal" ref="jump" style={{position: "absolute"}}>
        <div className="header">Header</div>
        <div className="content">
          <PlayForm asset={this.jumpData} onchange={(v) => {this.setState({event: this.jumpData})}}/>
        </div>
        <div className="actions">
          <div className="ui approve button">Approve</div>
          <div className="ui cancel button">Cancel</div>
        </div>
      </div>
    )
  }
  renderMusicModal(){
    return (
      <div className="ui modal" ref="music" style={{position: "absolute"}}>
        <div className="header">Header</div>
        <div className="content">
          <MusicForm asset={this.musicData} onchange={(v) => {this.setState({event: this.musicData})}}/>
        </div>
        <div className="actions">
          <div className="ui approve button">Approve</div>
          <div className="ui cancel button">Cancel</div>
        </div>
      </div>
    )
  }
  render () {
    if (!this.props.asset) {
      return null
    }

    const asset = this.props.asset
    let tools = []
    // TODO: separate tools by type - and fallback to InfoTool
    Object.keys(this.state.tools).forEach((tool) => {
      const Element = this.state.tools[tool].type || InfoTool

      tools.push(<Element asset={asset} info={this.state.tools[tool]} key={tool} />)
      tools.push(<br key={tool+'spacer'}/>)
    })

    return (
      <div ref="container">
        {this.renderPlayModal()}
        {this.renderMusicModal()}
        <div className='ui grid'>
          <div className='ten wide column'>
            <MapArea asset={asset} parent={this} ref='mapArea'>
              {asset}
            </MapArea>
          </div>
          <div className='six wide column'>
            {tools}
          </div>
        </div>
      </div>
    )
  }
}
