import _ from 'lodash'
import React, { PropTypes } from 'react'
import ActorMapArea from './ActorMapArea.js'

import MapToolbar from './Tools/ActorMapToolbar.js'

import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { showToast } from '/client/imports/routes/App'
import TileHelper from '../Common/Map/Helpers/TileHelper.js'
import ActorHelper from '../Common/Map/Helpers/ActorHelper.js'

import TileSet from './Tools/ActorTileset.js'
import EventTool from './Tools/EventTool.js'
import MapGenerator from './Tools/ActorMapGenerator.js'
import LayerTool from '../Common/Map/Tools/Layers.js'
import Properties from './Tools/ActorMapProperties.js'

import Cache from './Helpers/ActorCache.js'
import EditModes from '../Common/Map/Tools/EditModes.js'

import LayerProps from '../Common/Map/Props/LayerProps.js'
import TilesetProps from '../Common/Map/Props/TilesetProps.js'
import MapProps from '../Common/Map/Props/MapProps.js'
import ToolbarProps from '../Common/Map/Props/ToolbarProps.js'
import PropertiesProps from '../Common/Map/Props/PropertiesProps.js'

import PlayForm from './Modals/PlayForm.js'
import MusicForm from './Modals/MusicForm.js'

import EditMap from '../EditMap/EditMap.js'
import ActorMapErrorResolver from './ActorMapErrorResolver.js'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

export default class EditActorMap extends EditMap {
  static propTypes = {
    asset: PropTypes.object, // asset to be changed
    currUser: PropTypes.object, // current user
  }

  constructor(...a) {
    super(...a)
    registerDebugGlobal('ActorHelper', ActorHelper, __filename, 'ActorHelper of ActorMap editor')
  }

  setInitialStateFromContent() {
    this.v1_to_v2(this.props, mapData => {
      this.mgb_content2 = mapData

      this.state.editMode = this.options.mode
      this.state.randomMode = this.options.randomMode
      this.state.showGrid = this.options.showGrid
      this.state.jumpData = {
        map: '',
        x: 0,
        y: 0,
      }
      this.state.musicData = {
        music: '',
      }

      // stores tiles and images
      this.cache = new Cache(this.mgb_content2, () => {
        // is cache still present?
        this.cache && this.setState({ isLoading: false })
        if (Object.keys(this.props.asset.content2).length === 0) {
          this.quickSave('Empty map')
        }
      })

      // Properly update imported actor names and gids
      if (this.mgb_content2.tilesets && this.mgb_content2.tilesets.length > 1) {
        if (this.mgb_content2.tilesets[1].name.indexOf(':') === -1) {
          _.map(this.mgb_content2.tilesets, ts => {
            if (ts.name !== 'Actions' && ts.name.indexOf(':') === -1) {
              ts.name = this.props.asset.dn_ownerName + ':' + ts.name
            }
          })
        }
        if (this.mgb_content2.tilesets[1].firstgid < 100) {
          TileHelper.fixTilesetGids(this.mgb_content2)
          this.updateMap()
        }
      }
    })
  }

  componentWillReceiveProps(newp) {
    if (!newp.asset.content2) {
      return
    }
    // ignore older assets - and ignore empty content2 (content2 is empty for new maps)
    if (!_.isEqual(this.props.asset.content2, newp.asset.content2)) {
      // we don't need to update cache on every React update - because of observers in the TileCache and ActorHelper
      this.setState({ isLoading: true })
      this.cache &&
        this.cache.isReady() &&
        this.cache.update(this.mgb_content2, () => {
          this.setState({ isLoading: false })
          this.updateMap(newp)
        })
    }
  }

  updateMap(props = this.props) {
    this.setState({ isLoading: true })
    this.v1_to_v2(props, d => {
      this.preventUpdates = false

      // store old options - otherwise tools will auto switch and will piss off user
      /*if(this.mgb_content2 && this.mgb_content2.meta) {
        const oldOptions = this.mgb_content2.meta.options
        this.mgb_content2 = d
        this.mgb_content2.meta.options = oldOptions
      }
      else{*/

      this.mgb_content2 = d
      //}
      // or new Cache - if immutable is preferred - and need to force full cache update
      if (this.cache && this.cache.isReady()) {
        this.cache.update(d, () => {
          this.cache && this.setState({ isLoading: false })
        })
      } else {
        this.setState({ isLoading: false })
      }
    })
  }

  componentWillUnmount() {
    // ActorHelper.clearCache()
    super.componentWillUnmount()
    ActorHelper.cleanUp()
  }

  v1_to_v2(props, cb, c2 = props.asset.content2) {
    const names = {
      map: props.asset.name,
      user: props.asset.dn_ownerName,
    }
    ActorHelper.v1_to_v2(
      c2,
      names,
      mapData => {
        const errors = ActorHelper.getErrors()
        if (errors.length) {
          this.setState({ errors, isLoading: false })
          return
        }
        cb && cb(mapData)
      },
      (id, changes) => {
        //console.log("changed:", changes)
        // TODO: probably we should do something here if map contains errors
        if (this.state.errors && this.state.errors.length) {
          ActorHelper.cleanUp()
          this.setInitialStateFromContent()
          return
        }
        this.saveForUndo('External actor change')
        this.updateMap()
      },
      this.tilesetProps.removeTileset,
    )
  }

  handleSave(data, reason, thumbnail, skipUndo = false) {
    this.preventUpdates = false

    // can be already unmounted - as called by async function
    if (!this.cache) return

    // remove loading - which is set after adding new Actor
    this.setState({ isLoading: false })

    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }

    // isn't it too late to save for undo?
    // idea: call save for Undo - and set Timeout 0 for real save ?
    /*if(!skipUndo && !_.isEqual(this.lastSave, data)){
      // save for undo will prevent map updates - this.preventUpdates = true
      this.saveForUndo(reason)
    }*/

    // make sure we always have nice looking thumbnail
    if (!thumbnail && this.refs.map) this.refs.map.generatePreviewAndSaveIt(data, reason)
    else {
      const toSave = ActorHelper.v2_to_v1(data)
      this.props.handleContentChange(toSave, thumbnail, reason)
    }
  }

  showModal = (action, cb) => {
    $(this.refs[action])
      .modal({
        size: 'small',
        detachable: false,
        context: this.refs.container,
        onApprove: () => {
          cb(this.state[action + 'Data'])
        },
      })
      .modal('show')
  }

  renderPlayModal() {
    return (
      <div className="ui modal" ref="jump" style={{ position: 'absolute', padding: '5px' }}>
        <div className="header">Add Jump Event</div>
        <div className="content">
          <PlayForm
            asset={this.state.jumpData}
            onChange={v => {
              this.setState({ event: this.state.jumpData })
            }}
          />
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
      <div className="ui modal" ref="music" style={{ position: 'absolute' }}>
        <div className="header">Add Music Event</div>
        <div className="content">
          <MusicForm
            asset={this.state.musicData}
            onChange={() => {
              this.setState({ event: this.state.musicData })
            }}
          />
        </div>
        <div className="actions">
          <div className="ui approve button">Confirm</div>
          <div className="ui cancel button">Cancel</div>
        </div>
      </div>
    )
  }

  togglePlayState() {
    this.setState({ isPlaying: !this.state.isPlaying })
  }

  render() {
    if (this.state.errors && this.state.errors.length > 0)
      return (
        <ActorMapErrorResolver
          errors={this.state.errors}
          content2={this.props.asset.content2}
          callback={c2 => {
            ActorHelper.cleanUp()
            this.setInitialStateFromContent()
          }}
        />
      )

    // this stuff is required for proper functionality
    if (!this.mgb_content2 || !this.cache) return this.renderLoading()

    const { isLoading, isPlaying, activeLayer, activeTileset } = this.state

    const c2 = this.mgb_content2

    return (
      <div className="ui grid" ref="container" style={{ flexWrap: 'nowrap' }}>
        {isLoading && this.renderLoading()}
        {this.renderPlayModal()}
        {this.renderMusicModal()}

        <div className={(isPlaying ? 'sixteen' : 'thirteen') + ' wide column'}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ float: 'left' }}>
              <MapToolbar
                {...this.toolbarProps}
                isPlaying={isPlaying}
                options={this.options}
                undoSteps={this.mgb_undo}
                redoSteps={this.mgb_redo}
                ref="toolbar"
              />
            </div>
            <div style={{ float: 'right' }}>
              <div style={{ float: 'left', marginLeft: '5px' }}>
                <Properties
                  {...this.propertiesProps}
                  data={{
                    width: c2.width,
                    height: c2.height,
                  }}
                  isPlaying={isPlaying}
                />
              </div>
              <div style={{ float: 'left', marginLeft: '5px' }}>
                <EventTool
                  {...this.tilesetProps}
                  palette={this.cache.tiles}
                  activeTileset={activeTileset}
                  tilesets={c2.tilesets}
                  options={this.options}
                  isPlaying={isPlaying}
                />
              </div>
              <div style={{ float: 'left', marginLeft: '5px' }}>
                <MapGenerator
                  {...this.mapProps}
                  data={c2}
                  activeTileset={activeTileset}
                  activeLayer={activeLayer}
                  isPlaying={isPlaying}
                />
              </div>
            </div>
          </div>
          <div style={{ clear: 'both', overflow: 'hidden' }}>
            <ActorMapArea
              {...this.mapProps}
              showModal={this.showModal}
              playDataIsReady={!this.props.hasUnsentSaves && !this.props.asset.isUnconfirmedSave}
              isPlaying={isPlaying}
              cache={this.cache}
              activeLayer={activeLayer}
              highlightActiveLayer={this.options.highlightActiveLayer}
              canEdit={this.props.canEdit}
              options={this.options}
              data={c2}
              asset={this.props.asset}
              ref="map"
            />
          </div>
        </div>
        <div
          className={'three wide column'}
          style={
            isPlaying ? { display: 'none' } : { display: 'flex', flexDirection: 'column', minWidth: '175px' }
          }
        >
          <LayerTool
            {...this.layerProps}
            layers={c2.layers}
            options={this.options}
            activeLayer={activeLayer}
          />
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
