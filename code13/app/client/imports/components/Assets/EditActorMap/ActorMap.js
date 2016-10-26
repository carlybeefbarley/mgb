import React from 'react'
import BaseMapArea from '../Common/Map/BaseMapArea.js'

import TileHelper from '../Common/Map/Helpers/TileHelper'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'

import Layers from '../Common/Map/Tools/Layers'

import ActorTool from './Tools/ActorTool'
import EventTool from './Tools/EventTool'
import Properties from './Tools/Properties'
import MapToolbar from './Tools/MapToolbar'

import Plural from '/client/imports/helpers/Plural'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'

import PositionInfo from '../Common/Map/Tools/PositionInfo'
import DropArea from '../../Controls/DropArea'
import SmallDD from '../../Controls/SmallDD'

import Mage from '/client/imports/components/MapActorGameEngine/Mage'

import './../Common/Map/EditMap.css'

export default class MapArea extends BaseMapArea {

  constructor (props) {
    super(props)
    this.isLoading = true
  }

  set data(val){
    const l = this.getActiveLayer()
    this.activeAsset.content2 = val
    this._data = val;
    l && l.clearCache && l.clearCache()
  }
  get data () {
    return this._data
  }

  componentDidMount() {
    this.buildMap(() => {
      if (!this.data)
        this.data = TileHelper.genNewMap()

      $(this.refs.mapElement).addClass('map-filled')
      this.startEventListeners()
      this.fullUpdate()
    })
  }

  componentWillReceiveProps (props) {
    // console.log("New map data", props)
    // it's safe to update read only
    super.componentWillReceiveProps(props)
    if (!this.activeAsset || !this.props.parent.props.canEdit) {
      // TODO(stauzs) increase build map speed - otherwise it causes inifinite loop
      if(Date.now() - this.lastUpdate > 5000){
        this.lastUpdate = Date.now()
        this.buildMap(() => {
          this.update()
        })
      }
    }
  }

  buildMap(cb) {
    this.isLoading = true;
    const names = {
      map: this.props.asset.name,
      user: this.props.asset.dn_ownerName
    }
    ActorHelper.v1_to_v2(this.props.asset.content2, names, (md) => {
      this._data = md
      cb && cb()
      this.isLoading = false;
    })
  }

  resetMap() {
    const names = {
      map: this.props.asset.name,
      user: this.props.asset.dn_ownerName
    }
    this.data = ActorHelper.createEmptyMap()
    this.fullUpdate()
  }

  save (reason = 'no reason' , force = false) {
    const newData = JSON.stringify(this.data)
    // skip equal map save
    if (!force && this.savedData == newData)
      return

    this.savedData = newData

    // make sure thumbnail is nice - all layers has been drawn
    window.requestAnimationFrame(() => {
      this.props.parent.handleSave(ActorHelper.v2_to_v1(this.data) , reason, this.generatePreview())
    })
  }

  addTools () {
    this.addLayerTool()
    this.addActorTool()
    this.addEventTool()
    this.addPropertiesTool()
  }

  addActorTool() {
    this.addTool('Actor', 'Actors', {map: this}, ActorTool)
  }
  addEventTool() {
    this.addTool('Events', 'Events', {map: this}, EventTool)
  }
  addPropertiesTool() {
    this.addTool('Properties', 'Properties', {map: this}, Properties, true)
  }
  addLayerTool() {
    this.addTool('Layers', 'ActorMap Layers', { map: this }, Layers)
  }


  setActiveLayer(id){
    super.setActiveLayer(id)
    // Events only for events layer...
    if(this.collection.length && this.collection[0].gid < ActorHelper.TILES_IN_ACTIONS){
      const l = this.getActiveLayer()
      if(l && l.data.name != "Events"){
        this.clearActiveSelection()
      }
    }
  }

  // this bubbles up
  showModal(action, cb) {
    this.props.parent.showModal(action, (val) => {
      cb(val)
      this.update()
    })
  }

  // TODO(stauzs): clear cache
  cache = {}
  renderMage(){
    const self = this;
    return (
      <div
        className='tilemap-wrapper'
        onWheel={this.handleOnWheel.bind(this)}>
        <MapToolbar map={this} ref='tools' />
        <div style={{margin: "10px 0px"}}>
          <Mage
            ownerName={this.props.asset.dn_ownerName}
            startMapName={this.props.asset.name}
            isPaused={false}
            hideButtons={true}
            fetchAssetByUri={ (uri) => {

                return new Promise( function (resolve, reject) {
                  if(self.cache[uri]){
                    resolve(self.cache[uri]);
                  }
                  var client = new XMLHttpRequest()
                  client.open('GET', uri)
                  client.send()
                  client.onload = function () {
                    if (this.status >= 200 && this.status < 300){
                      self.cache[uri] = this.response
                      resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
                    }
                    else
                      reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
                  }
                  client.onerror = function () { reject(this.statusText) }
                })
              }}
            />
        </div>
      </div>
    )
  }

  render () {
    if(this.isLoading){
      return (<div className="noScrollbarDiv"
                   style={{
                   "position": "fixed",
                   "top": "40px", "bottom": "0px", "left": "60px",
                    "right": "345px", "overflow": "auto", "marginBottom": "0px"}}>
                <div style={{"padding": "0px", "height": "auto"}}>
                  <div className="ui basic segment" style={{"minHeight": "15em"}}>
                    <div className="ui active inverted dimmer">
                      <div className="ui text indeterminate loader">Loading</div>
                    </div><p></p></div></div></div>)
    }

    if(this.state.isPlaying){
      return this.renderMage()
    }

    return (
      <div
          className='tilemap-wrapper'
          onWheel={this.handleOnWheel.bind(this)}>
        <MapToolbar map={this} ref='toolbar' />
        { this.getNotification() }
        { this.renderMap() }
        { this.state.isPlaying && <MapPlayer map={this} /> }
        <PositionInfo getInfo={this.getInfo.bind(this)} ref='positionInfo' />
      </div>
    )
  }
}
