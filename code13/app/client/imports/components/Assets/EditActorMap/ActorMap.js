import React from 'react'
import BaseMapArea from '../Common/Map/BaseMapArea.js'

import TileHelper from '../Common/Map/Helpers/TileHelper'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'

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
  }

  componentWillReceiveProps(p){

    const l = this.getActiveLayer(p.activeLayer)
    this.state.isPlaying = p.isPlaying
    // Events only for events layer...
    if(this.collection.length && this.collection[0].gid < ActorHelper.TILES_IN_ACTIONS){
      if(l && l.data.name != "Events"){
        this.clearActiveSelection()
      }
    }

    // clear selection also if selected tile is not valid
    if(this.collection.length && this.collection[0].gid){
      const tile = this.collection[0];
      const ts = ActorHelper.getTilesetFromGid(tile.gid, this.data.tilesets)
      // clean selection by default.. and if check fails
      if(!ts || !ActorHelper.checks[l.data.name] || !ActorHelper.checks[l.data.name](ts)){
        this.clearActiveSelection()
      }
    }
  }

  // TODO(stauzs): clear cache
  cache = {}
  renderMage(){
    const self = this;
    return (
      <div
        className='tilemap-wrapper'
        onWheel={this.handleOnWheel.bind(this)}>
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

    if(this.state.isPlaying){
      return this.renderMage()
    }

    return (
      <div
          className={
            this.props.highlightActiveLayer
              ? 'tilemap-wrapper highlight-active-layer'
              : 'tilemap-wrapper'
          }
          onWheel={this.handleOnWheel.bind(this)}
        >
        { this.getNotification() }
        { this.renderMap() }
        <PositionInfo getInfo={this.getInfo.bind(this)} ref='positionInfo' />
      </div>
    )
  }
}
