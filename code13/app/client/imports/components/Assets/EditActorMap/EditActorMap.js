

import _ from 'lodash'
import React, { PropTypes } from 'react'
import ActorMapArea from './ActorMapArea.js'

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
      this.updateMap(newp)
    }
  }

  updateMap(props = this.props){
    this.setState({isLoading: true})
    this.v1_to_v2(props, (d) => {
      // store old options - otherwise tools will auto switch and will piss off user
      if(this.mgb_content2 && this.mgb_content2.meta) {
        const oldOptions = this.mgb_content2.meta.options
        this.mgb_content2 = d
        this.mgb_content2.meta.options = oldOptions
      }
      else{
        this.mgb_content2 = d
      }
      // or new Cache - if immutable is preferred - and need to force full cache update
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

  componentWillUnmount(){
    // ActorHelper.clearCache()
    super.componentWillUnmount()
    ActorHelper.cleanUp()
  }


  v1_to_v2(props, cb){
    const names = {
      map: props.asset.name,
      user: props.asset.dn_ownerName
    }
    ActorHelper.v1_to_v2(props.asset.content2, names, cb, (id, changes) => {
      //console.log("changed:", changes)
      this.saveForUndo("External actor change")
      this.updateMap()
    })
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

    // make sure we always have nice looking thumbnail
    if(!thumbnail && this.refs.map){
      this.refs.map.generatePreviewAndSaveIt()
    }
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
        <div className="header">Add Jump Event</div>
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

  renderMusicModal() {
    return (
      <div className="ui modal" ref="music" style={{position: "absolute"}}>
        <div className="header">Add Music Event</div>
        <div className="content">
          <MusicForm asset={this.state.musicData} onchange={ () => {this.setState( { event: this.state.musicData } ) } }/>
        </div>
        <div className="actions">
          <div className="ui approve button">Confirm</div>
          <div className="ui cancel button">Cancel</div>
        </div>
      </div>
    )
  }

  togglePlayState() { 
    this.setState( { isPlaying: !this.state.isPlaying } )
  }

  render () {
    // this stuff is required for proper functionality
    if (!this.mgb_content2 || !this.cache)
      return this.renderLoading()

    const { isLoading, isPlaying, activeLayer, activeTileset } = this.state

    const c2 = this.mgb_content2
    return (
      <div className='ui grid' ref="container">
        { isLoading && this.renderLoading() }
        {this.renderPlayModal()}
        {this.renderMusicModal()}

        <div className={ (isPlaying ? 'sixteen' : 'fourteen') + ' wide column'}>
          <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
            <div style={{float: 'left'}}>
              <MapToolbar
                {...this.toolbarProps}
                isPlaying={isPlaying}
                options={this.options}
                undoSteps={this.mgb_undo}
                redoSteps={this.mgb_redo}
              />
            </div>
            <div style={{float: 'right'}}>
              <div style={{float: 'left', marginLeft: '5px'}}>
                <Properties {...this.propertiesProps} data={{
                  width: c2.width,
                  height: c2.height
                }}/>
              </div>
              <div style={{float: 'left', marginLeft: '5px'}}>
                <EventTool
                  {...this.tilesetProps}
                  palette={this.cache.tiles}
                  activeTileset={activeTileset}
                  tilesets={c2.tilesets}
                  options={this.options}
                  />
              </div>
            </div>
          </div>
          <div style={{clear: 'both', overflow:'hidden'}}>
            <ActorMapArea
              {...this.mapProps}
              showModal={this.showModal}
              playDataIsReady={!this.props.hasUnsentSaves && !this.props.asset.isUnconfirmedSave}
              isPlaying={isPlaying}
              cache={this.cache}
              activeLayer={activeLayer}
              highlightActiveLayer={c2.meta.highlightActiveLayer}
              canEdit={this.props.canEdit}
              options={this.options}
              data={c2}
              asset={this.props.asset}
              ref='map' />
            </div>
        </div>
        <div className={'two wide '+ (isPlaying ? 'hidden' : '') + ' column'} style={{display: 'flex', flexDirection: 'column'}}>
          <LayerTool
            {...this.layerProps}
            layers={c2.layers}
            options={c2.meta}
            activeLayer={activeLayer}
            />
          <br />
          <TileSet
            {...this.tilesetProps}
            palette={this.cache.tiles}
            activeTileset={activeTileset}
            tilesets={c2.tilesets}
            options={this.options}
            />
        </div>
      </div>
    )
  }
}
