import _ from 'lodash'
import React, { PropTypes } from 'react'
import MapArea from './MapArea.js'
import InfoTool from '../Common/Map/Tools/InfoTool.js'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'

import TileSet from '../Common/Map/Tools/TileSet.js'
import ObjectList from '../Common/Map/Tools/ObjectList.js'

import LayerTool from './Tools/Layers.js'
import Properties from './Tools/Properties.js'


export default class EditMap extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    currUser: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {
      tools: {}
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

  handleSave (data, reason, thumbnail) {
    if(!this.props.canEdit){
      console.error("Read only map")
      return
    }
    // TODO: convert uploaded images to assets
    this.props.handleContentChange(data, thumbnail, reason)
  }

  render () {
    if (!this.props.asset) {
      return null
    }

    const asset = this.props.asset
    //let tools = []
    // TODO: separate tools by type - and fallback to InfoTool
   /* Object.keys(this.state.tools).forEach((tool) => {
      const Element = this.state.tools[tool].type || InfoTool

      tools.push(<Element asset={asset} info={this.state.tools[tool]} key={tool} />)
      tools.push(<br key={tool+'spacer'}/>)
    })*/



    return (
      <div className='ui grid'>
        <div className='ten wide column'>
          <MapArea asset={asset} parent={this} ref='map'>
            {asset}
          </MapArea>
        </div>
        <div className='six wide column'>
          { this.refs.map &&
            <div>
              <LayerTool map={this.refs.map} />
              <br />
              <TileSet map={this.refs.map} />
              <br />
              <Properties map={this.refs.map} />
            </div>
          }
        </div>
      </div>
    )
  }
}
