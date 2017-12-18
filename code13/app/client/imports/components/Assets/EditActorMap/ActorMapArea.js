import _ from 'lodash'
import React from 'react'
import { Accordion } from 'semantic-ui-react'

import BaseMapArea from '../Common/Map/BaseMapArea'
import ActorHelper from '../Common/Map/Helpers/ActorHelper'
import actorOptions from '../Common/ActorOptions.js'
import PositionInfo from '../Common/Map/Tools/PositionInfo'
import LayerTypes from '../Common/Map//Tools/LayerTypes'
import GridLayer from '../Common/Map/Layers/GridLayer'
import MaskLayer from '../Common/Map/Layers/MaskLayer'

import Mage from '/client/imports/components/MapActorGameEngine/Mage'

import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'

import './../Common/Map/EditMap.css'

export default class ActorMapArea extends BaseMapArea {
  constructor(props) {
    super(props)
    this.hoveredTiles = []
    this.handleMouseInfo = this.handleMouseInfo.bind(this)
  }

  componentWillReceiveProps(p) {
    const l = this.getActiveLayer(p.activeLayer)
    // Events only for events layer...
    if (this.collection.length && this.collection[0].gid < ActorHelper.TILES_IN_ACTIONS) {
      if (l && l.data.name != 'Events') {
        this.clearActiveSelection()
      }
    }

    // clear selection also if selected tile is not valid
    if (this.collection.length && this.collection[0].gid) {
      const tile = this.collection[0]
      const ts = ActorHelper.getTilesetFromGid(tile.gid, this.data.tilesets)
      // clean selection by default.. and if check fails
      if (!ts || !ActorHelper.checks[l.data.name] || !ActorHelper.checks[l.data.name](ts)) {
        this.clearActiveSelection()
      }
    }
  }

  fetchAssetByUri = uri => {
    return fetchAssetByUri(uri, false) // 2nd param is cache - but it tends to overcache - etag would be better
  }

  handleMouseInfo(e) {
    // Conflicts with getting pos offsets
    if (e.target.tagName !== 'CANVAS') {
      return
    }

    this.hoveredTiles = []
    this.layers.map(layer => {
      const tileInfo = layer.getTilePosInfo(e)
      // it's save here to modify getTilePosInfo return value as it return new object - and it won't be used in other place
      tileInfo.layer = layer
      this.hoveredTiles.push(tileInfo)
    })
    this.hoveredTiles
  }

  // render related methods
  getInfo(info, count, i) {
    if (!info.gid) {
      return null
    }
    const layer = this.getActiveLayer()

    info = info || (layer ? layer.getInfo() : null)
    let actor = info ? ActorHelper.getTilesetFromGid(info.gid, this.props.data.tilesets) : null

    return (
      <div key={i}>
        {
          <div>
            <b style={{ fontSize: '12px' }}>
              {(info.layer ? info.layer.data.name : layer.data.name) +
                ' Layer (' +
                info.x +
                ', ' +
                info.y +
                '):'}
            </b>
            <br />
            {actor.actor.databag && (
              <span>
                <span style={{ fontSize: '11px' }}>
                  &ensp;<b>Actor: </b>
                  {actor.name.split(':').pop() + ' (' + actor.imagewidth + 'x' + actor.imageheight + ')'}
                </span>
                <br />
                <span style={{ fontSize: '11px' }}>
                  &ensp;<b>Type: </b>
                  {_.findKey(actorOptions.actorType, type => {
                    return type === actor.actor.databag.all.actorType
                  })}
                </span>
              </span>
            )}
            {actor.name === 'Actions' && (
              <span style={{ fontSize: '11px' }}>
                &ensp;<b>Type: </b>Map Event
              </span>
            )}
            {i + 1 < count && <div style={{ height: '11px' }} />}
          </div>
        }
      </div>
    )
  }

  getAllInfo() {
    const ret = []
    let activeLayer = this.getActiveLayer()
    let layerInfo = activeLayer ? activeLayer.getInfo() : null
    let count = 0

    if (layerInfo && this.props.data)
      if (
        layerInfo.x + 1 > this.props.data.width ||
        layerInfo.y + 1 > this.props.data.height ||
        layerInfo.x < 0 ||
        layerInfo.y < 0
      )
        return [
          <b style={{ fontSize: '12px' }} key={-1}>
            {activeLayer.data.name + ' Layer (' + layerInfo.x + ', ' + layerInfo.y + ')'}
          </b>,
        ]

    this.hoveredTiles.map((tile, i) => {
      if (tile.gid > 0) {
        count += i + 1
      }
      ret.push(this.getInfo(tile, count, i))
    })

    if (count === 0) {
      if (layerInfo)
        return [
          <b style={{ fontSize: '12px' }} key={-1}>
            {activeLayer.data.name + ' Layer (' + layerInfo.x + ', ' + layerInfo.y + ')'}
          </b>,
        ]
      else return [<div key={-1}>Hover over a tile on the map.</div>]
    }
    return ret.reverse()
  }

  renderMap() {
    const data = this.data

    if (!data || !data.layers) return <div className="map-empty" ref="mapElement" />

    const layers = []

    for (let i = 0; i < data.layers.length; i++) {
      const LayerComponent = LayerTypes.toComponent(data.layers[i].type)
      if (LayerComponent) {
        layers.push(
          <LayerComponent
            {...this.props}
            useNewFillAlgorithm
            data={data.layers[i]}
            mapData={data}
            options={this.props.options}
            getLayers={this.getLayers.bind(this)}
            palette={this.palette}
            isActive={this.props.activeLayer == i}
            camera={this.camera}
            startTime={this.startTime}
            getEditMode={() => this.props.getMode()}
            setEditMode={mode => {
              this.props.setMode(mode)
            }}
            getSelection={() => {
              return this.selection
            }}
            getTmpSelection={() => {
              return this.tmpSelection
            }}
            getCollection={() => {
              return this.collection
            }}
            clearTmpSelection={() => {
              this.tmpSelection.clear()
            }}
            clearSelection={() => {
              this.selection.clear()
            }}
            addFirstToSelection={tile => {
              if (!this.tmpSelection.length) {
                this.tmpSelection.pushUniquePos(tile)
              }
            }}
            pushUniquePos={tile => {
              this.tmpSelection.pushUniquePos(tile)
            }}
            swapOutSelection={() => {
              this.swapOutSelection()
            }}
            selectionToCollection={() => {
              this.selectionToCollection()
            }}
            keepDiffInSelection={() => this.keepDiffInSelection()}
            removeFromSelection={() => this.removeFromSelection()}
            onImageLayerDrop={(e, options) => this.onImageLayerDrop(e, options)}
            getImage={src => this.props.cache.images[src]}
            // object layer draws selection shapes on the grid - as it's always on top
            getOverlay={() => this.refs.grid}
            key={i}
            ref={this.addLayerRef.bind(this, i)}
          />,
        )
      }
    }
    layers.push(
      <GridLayer
        map={this}
        key={data.layers.length}
        layer={this.layers[this.props.activeLayer]}
        ref="grid"
      />,
    )

    // TODO: adjust canvas height
    return (
      <div
        ref="mapElement"
        id="mgb_map_area"
        onContextMenu={e => {
          e.preventDefault()
          return false
        }}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseInfo}
        onTouchStart={this.handleMouseDown}
        style={{ height: 720 + 'px', position: 'relative', margin: '10px 0' }}
      >
        {layers}
        <MaskLayer map={this} layer={this.layers[this.props.activeLayer]} ref="mask" />
        <Accordion
          inverted
          className="inspectInfo"
          panels={[
            {
              key: 'position',
              title: {
                key: 'position-title',
                icon: null,
                content: <i className="icon search" style={{ float: 'right', color: 'white' }} />,
              },
              content: {
                key: 'position-content',
                content: (
                  <div style={{ padding: '5px', minWidth: '200px' }}>
                    <PositionInfo getInfo={this.getAllInfo.bind(this)} ref="positionInfo" />
                  </div>
                ),
              },
            },
          ]}
        />
      </div>
    )
  }

  renderMage() {
    const { asset, playDataIsReady } = this.props
    const isMgb1Game = asset.text.startsWith('Imported from MGB1')

    if (!playDataIsReady) return <p>Waiting for Cloud save to flush</p>

    return (
      <div className="tilemap-wrapper" onWheel={this.handleOnWheel.bind(this)}>
        <div style={{ margin: '10px 0px' }}>
          <Mage
            ownerName={asset.dn_ownerName}
            startMapName={asset.name}
            isPaused={false}
            isMgb1Game={isMgb1Game}
            hideButtons
            fetchAssetByUri={this.fetchAssetByUri}
          />
        </div>
      </div>
    )
  }

  render() {
    if (this.props.isPlaying) return this.renderMage()

    return (
      <div
        className={
          this.props.highlightActiveLayer ? (
            'tilemap-wrapper highlight-active-layer mode-' + this.props.getMode()
          ) : (
            'tilemap-wrapper mode-' + this.props.getMode()
          )
        }
        onWheel={this.handleOnWheel.bind(this)}
      >
        {this.getNotification()}
        {this.renderMap()}
      </div>
    )
  }
}
