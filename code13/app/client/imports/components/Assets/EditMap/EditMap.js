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
import MapToolbar from './Tools/MapToolbar.js'

import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'

import TileHelper from '../Common/Map/Helpers/TileHelper.js'
import TileSet from '../Common/Map/Tools/TileSet.js'
import ObjectList from '../Common/Map/Tools/ObjectList.js'

import LayerTool from './Tools/Layers.js'
import Properties from './Tools/Properties.js'

import Cache from '../Common/Map/Helpers/TileCache.js'
import EditModes from '../Common/Map/Tools/EditModes.js'

import LayerProps from '../Common/Map/Props/LayerProps.js'
import TilesetProps from '../Common/Map/Props/TilesetProps.js'
import MapProps from '../Common/Map/Props/MapProps.js'
import ToolbarProps from '../Common/Map/Props/ToolbarProps.js'

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
      editMode: EditModes.stamp,
      highlightActiveLayer: true,
      randomMode: false,
      showGrid: true,
      preview: true,
      undo: [],
      redo: [],
      content2: this.props.asset.content2
    }

    this.lastSave = this.state.content2
    this.ignoreUndo = 0

    if(this.props.asset.content2){
      // stores tiles and images
      this.setInitialStateFromContent()
    }
    // new map???
    else{
      this.createNewMap()
      /*
      c2 = TileHelper.
      c2.meta = {
        options: {
          // empty maps aren't visible without grid
          showGrid: 1,
          camera: { _x: 0, _y: 0, _zoom: 1 },
          preview: false,
          mode: 'stamp',
          randomMode: false
        }
      }
       */
    }

    this.layerProps = this.enableTrait(LayerProps)
    this.tilesetProps = this.enableTrait(TilesetProps)
    this.mapProps = this.enableTrait(MapProps)
    this.toolbarProps = this.enableTrait(ToolbarProps)
  }

  setInitialStateFromContent(){
    this.cache = new Cache(this.props.asset.content2, () => {
      this.setState({isLoading:  false})
    })
    // set last edit mode ???
    this.state.editMode = this.options.mode
    this.state.randomMode = this.options.randomMode
    this.state.showGrid = this.options.showGrid
  }

  createNewMap(){

  }

  get meta() {
    return this.state.content2.meta
  }

  get options() {
    return this.meta.options
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

  componentWillReceiveProps(newp){
    if(newp.asset.content2) {
      this.setState({isLoading: true})
      // or new Cache - if immutable is preferred - and need to force full cache update
      this.cache.update(newp.asset.content2, () => {
        this.setState({isLoading: false})
      })
    }
  }

  enableTrait(trait) {
    const out = {}
    for (let i in trait) {
      out[i] = trait[i].bind(this)
    }
    return out
  }

  getUser () {
    return this.props.currUser.profile.name
  }

  saveForUndo(reason = '' , skipRedo = false) {
    if (this.ignoreUndo)
      return
    const toSave = { data: this.copyData(this.state.content2), reason }
    const undo = this.state.undo;
    // prevent double saving undo
    if (undo.length && undo[undo.length - 1].data == toSave.data)
      return

    if (!skipRedo)
      this.state.redo.length = 0

    undo.push(toSave)
    this.setState({undo})
  }
  doUndo () {
    if (!this.state.undo.length)
      return

    const pop = this.state.undo.pop()
    this.state.redo.push(pop)
    this.handleSave(JSON.parse(pop.data), "Undo " + pop.reason, void(0), true)
  }
  doRedo () {
    if (!this.state.redo.length)
      return

    const pop = this.state.redo.pop()
    this.state.undo.push(pop)
    this.handleSave(JSON.parse(pop.data), "Redo " + pop.reason, void(0), true)
  }

  enableMode(mode){
    // this seems a little bit strange - state and props have same variable
    // probably state should hold only props.options ?
    this.options.mode = mode
    this.setState({editMode: mode})
  }

  handleSave (data, reason, thumbnail, skipUndo = false) {
    if(!this.props.canEdit){
      this.props.editDeniedReminder()
      return
    }
    if(!skipUndo && !_.isEqual(this.lastSave, data)){
      this.saveForUndo(reason)
    }

    // TODO: convert uploaded images to assets
    this.props.handleContentChange(data, thumbnail, reason)
  }

  quickSave(reason = "noReason", thumbnail = null){
    return this.handleSave(this.state.content2, reason, thumbnail)
  }

  // probably copy of data would be better to hold .. or not research strings vs objects
  // TODO(stauzs): research memory usage - strings vs JS objects
  copyData = (data) => {
    return JSON.stringify(data)
  }

  render () {
    if(!this.state.content2 || this.state.isLoading){
      return null
    }

    // this is temporary hack - until all references to map will be cleared
    if(!this.refs.map){
      window.setTimeout(() => {
        this.forceUpdate()
      }, 100)
    }
    const c2 = this.state.content2
    return (
      <div className='ui grid'>
        <div className='ten wide column'>
          <MapToolbar
            {...this.toolbarProps}
            options={this.options}
            undoSteps={this.state.undo}
            redoSteps={this.state.redo}
          />
          <MapArea
            {...this.mapProps}
            // this is nice UX shortcut - user don't need to create layer - and drop image
            // it allows simply drop image on map
            addLayer={this.layerProps.addLayer}
            cache={this.cache}
            activeLayer={this.state.activeLayer}
            highlightActiveLayer={c2.meta.highlightActiveLayer}
            canEdit={this.props.canEdit}
            options={this.options}
            data={c2}

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

          <TileSet
            {...this.tilesetProps}
            palette={this.cache.tiles}
            activeTileset={this.state.activeTileset}
            tilesets={c2.tilesets}
            options={this.options}
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
