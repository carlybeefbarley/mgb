import React from 'react'
import { Accordion } from 'semantic-ui-react'

import BaseMapArea from '../Common/Map/BaseMapArea'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'
import PositionInfo from '../Common/Map/Tools/PositionInfo'
import LayerTypes     from '../Common/Map//Tools/LayerTypes'
import GridLayer      from '../Common/Map/Layers/GridLayer'
import MaskLayer      from '../Common/Map/Layers/MaskLayer'

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

   // render related methods
  getInfo() {
    const layer = this.getActiveLayer()
    const types = ['Player', 'Non-Playable Character (NPC)', 'Item, Wall, or Scenery']

    let info = layer ? layer.getInfo() : ''
    //let layers = layer ? this.sortLayersByActive(layer.data.name) : []
    let actor = info ? (info.gid ? this.props.data.tilesets[Math.floor(info.gid/100)] : null) : null

    return (
      <div>
          {
            info
            ?
            (<span>
              {
              info.gid
              ?
              <p>
                <b style={{fontSize: '1.2em'}}>{layer.data.name + ' Layer (' + info.x + ', ' + info.y + '):'}</b>
                <br />
                <span>&ensp;<b>Actor: </b>{actor.actor.databag.all.defaultGraphicName}</span>
                <br />
                <span>&ensp;<b>Type: </b>{types[parseInt(actor.actor.databag.all.actorType)]}</span>
              </p>
              :
              <b style={{fontSize: '1.2em'}}>{layer.data.name + ' Layer (' + info.x + ', ' + info.y + ')'}</b>
              }
            </span>)
            :
            'Hover over a tile on the map.'
          }
      </div>
    )
  }

  // Sort Layers to show in Inspect info so that Active Layer is at the top
  sortLayersByActive(activeLayer) {
    const layers = ['Event', 'Foreground', 'Active', 'Background']
    const newLayers = []
    const index = layers.indexOf(activeLayer)
    layers.splice(index, 1)
    newLayers[0] = activeLayer
    layers.map((layer) => newLayers.push(layer))
    return newLayers
  }

  renderMap() {
    const data = this.data

    if (!data || !data.layers)
      return (<div className='map-empty' ref='mapElement' />)

    const layers = []

    for (let i = 0; i < data.layers.length; i++) {
      const LayerComponent = LayerTypes.toComponent(data.layers[i].type)
      if(LayerComponent) {
        layers.push(
          <LayerComponent
            {...this.props}
            data={data.layers[i]}
            mapData={data}
            options={this.props.options}
            getLayers={this.getLayers.bind(this)}

            palette={this.palette}
            isActive={this.props.activeLayer == i}
            camera={this.camera}
            startTime={this.startTime}

            getEditMode={() => this.props.getMode()}
            setEditMode={(mode) => {this.props.setMode(mode)}}

            getSelection={() => {return this.selection}}
            getTmpSelection={() => {return this.tmpSelection}}
            getCollection={() => {return this.collection}}

            clearTmpSelection={() => {this.tmpSelection.clear()}}
            clearSelection={() => {this.selection.clear()}}
            addFirstToSelection={(tile) => { if(!this.tmpSelection.length){this.tmpSelection.pushUniquePos(tile)}}}
            pushUniquePos={(tile) => {this.tmpSelection.pushUniquePos(tile)}}
            swapOutSelection={() => {this.swapOutSelection()}}
            selectionToCollection={() => {this.selectionToCollection()}}
            keepDiffInSelection={() => this.keepDiffInSelection()}
            removeFromSelection={() => this.removeFromSelection()}
            onImageLayerDrop={(e, options) => this.onImageLayerDrop(e, options)}
            getImage={src => this.props.cache.images[src]}

            // object layer draws selection shapes on the grid - as it's always on top
            getOverlay={() => this.refs.grid}


            key={i}
            ref={ this.addLayerRef.bind(this, i) }
            />)
      }
    }
    layers.push(
      <GridLayer map={this} key={data.layers.length} layer={this.layers[this.props.activeLayer]} ref='grid' />
    )
    // TODO: adjust canvas height
    return (
      <div
        ref='mapElement'
        id="mgb_map_area"
        onContextMenu={e => { e.preventDefault(); return false;}}
        onMouseDown={this.handleMouseDown}
        onTouchStart={this.handleMouseDown}
        style={{ height: 640 + 'px', position: 'relative', margin: '10px 0' }}>
        {layers}
        <MaskLayer map={this} layer={this.layers[this.props.activeLayer]} ref='mask' />
        <Accordion inverted className='inspectInfo'>
          <Accordion.Title>
            <i className='icon search' style={{float: 'right', color: 'white'}} />
          </Accordion.Title>
          <Accordion.Content style={{padding: '5px', minWidth: '18em'}}>
            <PositionInfo getInfo={this.getInfo.bind(this)} ref='positionInfo' />
          </Accordion.Content>
        </Accordion>
      </div>
    )
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
      </div>
    )
  }
}
