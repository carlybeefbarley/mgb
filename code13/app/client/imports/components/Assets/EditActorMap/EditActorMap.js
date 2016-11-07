

import _ from 'lodash'
import React, { PropTypes } from 'react'
import MapArea from './ActorMap.js'

import InfoTool from '../Common/Map/Tools/InfoTool.js'
import MapToolbar from './Tools/ActorMapToolbar.js'

import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'

import TileHelper from '../Common/Map/Helpers/TileHelper.js'
import ActorHelper from '../Common/Map/Helpers/ActorHelper.js'

import TileSet from './Tools/ActorTileset.js'
import EventTool from './Tools/EventTool.js'
import ObjectList from '../Common/Map/Tools/ObjectList.js'

import LayerTool from '../Common/Map/Tools/Layers.js'
import Properties from './Tools/ActorMapProperties.js'

import Cache from './Helpers/ActorCache.js'
import EditModes from '../Common/Map/Tools/EditModes.js'

import LayerProps from '../Common/Map/Props/LayerProps.js'
import TilesetProps from '../Common/Map/Props/TilesetProps.js'
import MapProps from '../Common/Map/Props/MapProps.js'
import ToolbarProps from '../Common/Map/Props/ToolbarProps.js'
import PropertiesProps from '../Common/Map/Props/PropertiesProps.js'

import PlayForm from "./Modals/PlayForm.js"
import MusicForm from "./Modals/MusicForm.js"

import EditMap from '../EditMap/EditMap.js'

export default class EditActorMap extends EditMap {
  static propTypes = {
    asset: PropTypes.object,    // asset to be changed
    currUser: PropTypes.object  // current user
  }

  setInitialStateFromContent(){
    this.v1_to_v2(this.props, (mapData) => {
      this.mgb_content2 = mapData

      this.state.editMode = this.options.mode
      this.state.randomMode = this.options.randomMode
      this.state.showGrid = this.options.showGrid
      this.state.jumpData = {
        map: '',
        x: 0,
        y: 0
      }
      this.state.musicData = {
        music: ''
      }

      // stores tiles and images
      this.cache = new Cache(this.mgb_content2, () => {
        this.setState({isLoading:  false})
      })
    })
  }

  componentWillReceiveProps(newp){
    // ignore older assets
    if(_.isEqual(this.lastSave, newp.asset.content2)){
      this.setState({isLoading: true})
      this.cache && this.cache.isReady() && this.cache.update(this.mgb_content2, () => {
        this.setState({isLoading: false})
      })
      return
    }
    if(newp.asset.content2) {
      this.setState({isLoading: true})
      this.v1_to_v2(newp, (d) => {
        // or new Cache - if immutable is preferred - and need to force full cache update
        this.mgb_content2 = d;
        if(this.cache && this.cache.isReady()) {
          this.cache && this.cache.isReady() && this.cache.update(d, () => {
            this.setState({isLoading: false})
          })
        }
        else{
          this.setState({isLoading: false})
        }
      })
    }
  }



  v1_to_v2(props, cb){
    const names = {
      map: props.asset.name,
      user: props.asset.dn_ownerName
    }
    ActorHelper.v1_to_v2(props.asset.content2, names, cb)
  }

  handleSave (data, reason, thumbnail, skipUndo = false) {
    //return;
    if(!this.props.canEdit){
      this.props.editDeniedReminder()
      return
    }
    if(!skipUndo && !_.isEqual(this.lastSave, data)){
      this.saveForUndo(reason)
    }

    const toSave = ActorHelper.v2_to_v1(data)
    this.lastSave = toSave

    // TODO: convert uploaded images to assets
    this.props.handleContentChange(toSave, thumbnail, reason)
  }

  showModal = (action, cb) => {
    $(this.refs[action]).modal({
      size: "small",
      detachable: false,
      context: this.refs.container,
      onApprove: () => {
        cb(this.state[action+"Data"])
      }
    }).modal("show")
  }

  renderPlayModal(){
    return (
      <div className="ui modal" ref="jump" style={{position: "absolute"}}>
        <div className="header">Header</div>
        <div className="content">
          <PlayForm asset={this.state.jumpData} onchange={(v) => {this.setState({event: this.state.jumpData})}}/>
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
          <MusicForm asset={this.state.musicData} onchange={(v) => {this.setState({event: this.state.musicData})}}/>
        </div>
        <div className="actions">
          <div className="ui approve button">Approve</div>
          <div className="ui cancel button">Cancel</div>
        </div>
      </div>
    )
  }

  render () {
    // this stuff is required for proper functionality
    if(!this.mgb_content2 || this.state.isLoading || !this.cache){
      return null
    }

    const c2 = this.mgb_content2
    return (
      <div className='ui grid' ref="container">
        {this.renderPlayModal()}
        {this.renderMusicModal()}
        <div className='ten wide column'>
          <MapToolbar
            {...this.toolbarProps}
            isPlaying={this.state.isPlaying}
            options={this.options}
            undoSteps={this.mgb_undo}
            redoSteps={this.mgb_redo}
          />
          <MapArea
            {...this.mapProps}
            showModal={this.showModal}

            isPlaying={this.state.isPlaying}
            cache={this.cache}
            activeLayer={this.state.activeLayer}
            highlightActiveLayer={c2.meta.highlightActiveLayer}
            canEdit={this.props.canEdit}
            options={this.options}
            data={c2}

            asset={this.props.asset}
            ref='map' />
        </div>
        <div className='six wide column'>
          <LayerTool
            {...this.layerProps}
            layers={c2.layers}
            options={c2.meta}
            activeLayer={this.state.activeLayer}
            />
          <br />
          <EventTool
            {...this.tilesetProps}
            palette={this.cache.tiles}
            activeTileset={this.state.activeTileset}
            tilesets={c2.tilesets}
            options={this.options}
            />
          <br />
          <TileSet
            {...this.tilesetProps}
            palette={this.cache.tiles}
            activeTileset={this.state.activeTileset}
            tilesets={c2.tilesets}
            options={this.options}
            />
          <br />
          <Properties {...this.propertiesProps} data={{
            width: c2.width,
            height: c2.height
          }}/>
        </div>
      </div>
    )
  }
}
