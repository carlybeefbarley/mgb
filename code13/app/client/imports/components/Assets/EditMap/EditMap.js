/*
Flow:
  EditMap - components:
      * controls children and stores/passes state to children
    |-> Toolbar
         * misc tools - usually will change state of tools mentioned below

    |-> MapArea:
    |    * controls layers
      |-> Layer:
      |      * draws map layer
      |      * allows to edit active layer - insert / remove tiles / objects
      |      * reports changed data (with callback) to MapArea -> EditMap
      |      * shows grid

    |-> LayerTool: DONE
    |    * allows switching between layers -> reports activeLayer to EditMap
    |    * shows / hides layer
      |-> LayerToolControl:
      |   * adds / removes layer
      |   * orders layers
      |   * highlights active layer

    |-> Tileset: DONE
    |    * allows to add new tilesets from graphics
    |    * allows to update tileset image from graphics
    |    * picks tiles (adds to selection) -> reports to EditMap
      |-> TilesetTools:
      |    * removes tileset
      |    * picks active tileset

    |-> Properties:
    |    * edits map properties
    |    * edits active layer properties
    |    * edits active tileset / object / properties..
    |    * allows to add arbitrary data to map objects/layer/tileset

    |-> Errors - list with errors
 */

import _ from 'lodash'
import React, { PropTypes } from 'react'
import MapArea from './MapArea.js'

import InfoTool from '../Common/Map/Tools/InfoTool.js'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'

import TileHelper from '../Common/Map/Helpers/TileHelper.js'
import TileSet from '../Common/Map/Tools/TileSet.js'
import ObjectList from '../Common/Map/Tools/ObjectList.js'

import LayerTool from './Tools/Layers.js'
import Properties from './Tools/Properties.js'

import Cache from '../Common/Map/Helpers/TileCache.js'
import EditModes from '../Common/Map/Tools/EditModes.js'

import LayerTraits from '../Common/Map/Traits/LayerTraits.js'
import TilesetTraits from '../Common/Map/Traits/TilesetTraits.js'

export default class EditMap extends React.Component {
  static propTypes = {
    asset: PropTypes.object,    // asset to be changed
    currUser: PropTypes.object  // current user
  }

  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      activeLayer: 0,
      activeTileset: 0,
      editMode: EditModes.stamp
    }

    if(this.props.asset.content2){
      // stores tiles and images
      this.cache = new Cache(this.props.asset.content2, () => {
        this.setState({isLoading:  false})
      })
      // set last edit mode ???
      this.state.editMode = this.props.asset.content2.meta.mode
    }

    this.layerTraits = this.enableTrait(LayerTraits)
    this.tilesetTraits = this.enableTrait(TilesetTraits)

  }

  componentDidMount () {
    this.doSnapshotActivity()
  }

  componentWillReceiveProps(newp){
    if(newp.asset.content2) {
      this.setState({isLoading: true})
      // or new Cache - if immutable is preferred - and need to force full cache update
      this.cache.update(newp.asset.content2, () => {
        this.setState({isLoading: false})
      })
    }
  }

  enableTrait(trait){
    const out = {}
    for (let i in trait){
      out[i] = trait[i].bind(this)
    }
    return out
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


  handleSave (data, reason, thumbnail) {
    if(!this.props.canEdit){
      console.error("Read only map")
      return
    }
    // TODO: convert uploaded images to assets
    this.props.handleContentChange(data, thumbnail, reason)
  }
  quickSave(reason = "noReason", thumbnail = null){
    return this.handleSave(this.props.asset.content2, reason, thumbnail)
  }



  showGridToggle(){
    const meta = this.props.asset.content2.meta
    meta.highlightActiveLayer = !meta.highlightActiveLayer
  }

  render () {
    if(!this.props.asset || this.state.isLoading){
      return null
    }
    const asset = this.props.asset
    // this is temporary hack - until all references to map will be cleared
    if(!this.refs.map){
      window.setTimeout(() => {
        this.forceUpdate()
      }, 100)
    }

    const c2 = this.props.asset.content2
    return (
      <div className='ui grid'>
        <div className='ten wide column'>
          <MapArea
            asset={asset}
            parent={this}

            cache={this.cache}
            activeLayer={this.state.activeLayer}
            highlightActiveLayer={c2.meta.highlightActiveLayer}
            ref='map'></MapArea>
        </div>
        <div className='six wide column'>
          <LayerTool
            {...this.layerTraits}
            layers={c2.layers}
            options={c2.meta}
            activeLayer={this.state.activeLayer}
            />
          <br />

          <TileSet
            {...this.tilesetTraits}
            palette={this.cache.tiles}
            tilesets={c2.tilesets}
            activeTileset={this.state.activeTileset}
            options={c2.meta}
            />

          { this.refs.map &&
          <div>

            <br />
            <Properties map={this.refs.map} />
          </div>
          }
        </div>
      </div>
    )
  }
}
