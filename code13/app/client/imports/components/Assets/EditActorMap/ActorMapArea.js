import React from 'react'

import BaseMapArea from '../Common/Map/BaseMapArea'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'
import PositionInfo from '../Common/Map/Tools/PositionInfo'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'

import {fetchAssetByUri} from '/client/imports/helpers/assetFetchers'

import './../Common/Map/EditMap.css'

export default class ActorMapArea extends BaseMapArea {

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps(p){

    const l = this.getActiveLayer(p.activeLayer)
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

  fetchAssetByUri = (uri) => {
    return fetchAssetByUri(uri, false) // 2nd param is cache - but it tends to overcache - etag would be better
  }

  renderMage() {
    const { asset, playDataIsReady } = this.props

    if (!playDataIsReady)
      return <p>Waiting for Cloud save to flush</p>

    return (
      <div
        className='tilemap-wrapper'
        onWheel={this.handleOnWheel.bind(this)}>
        <div style={{margin: "10px 0px"}}>
          <Mage
            ownerName={asset.dn_ownerName}
            startMapName={asset.name}
            isPaused={false}
            hideButtons={true}
            fetchAssetByUri={ this.fetchAssetByUri}
            />
        </div>
      </div>
    )
  }

  render () {

    if (this.props.isPlaying)
      return this.renderMage()

    return (
      <div
          className={
            this.props.highlightActiveLayer
              ? 'tilemap-wrapper highlight-active-layer mode-' + this.props.getMode()
              : 'tilemap-wrapper mode-' + this.props.getMode()
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