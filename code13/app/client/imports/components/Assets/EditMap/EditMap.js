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
import PropertiesProps from '../Common/Map/Props/PropertiesProps.js'
import ObjectListProps from '../Common/Map/Props/ObjectListProps.js'

import SpecialGlobals from '/imports/SpecialGlobals'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'


export default class EditMap extends React.Component {
  static propTypes = {
    asset: PropTypes.object,    // asset to be changed
    currUser: PropTypes.object  // current user
  }

  constructor (props) {
    super(props)
    registerDebugGlobal( 'editMap', this, __filename, 'Active Instance of Map editor')

    this.state = {
      isLoading: true,
      activeLayer: 0,
      activeTileset: 0,
      activeObject: -1,

      editMode: EditModes.stamp,
      highlightActiveLayer: true,
      randomMode: false,
      showGrid: true,
      preview: false
    }

    // undo / redo buffers
    this.mgb_undo = []
    this.mgb_redo = []
    this.ignoreUndo = 0

    if(this.props.asset.content2){
      // stores tiles and images
      this.setInitialStateFromContent()
    }
    // new map???
    else{
      this.createNewMap()
    }

    this.lastSave = this.mgb_content2

    this.layerProps = this.enableTrait(LayerProps)
    this.tilesetProps = this.enableTrait(TilesetProps)
    this.mapProps = this.enableTrait(MapProps)
    this.toolbarProps = this.enableTrait(ToolbarProps)
    this.propertiesProps = this.enableTrait(PropertiesProps)
    this.objectListProps = this.enableTrait(ObjectListProps)
  }

  get preventUpdates(){
    return this._preventUpdates
  }
  set preventUpdates(v){
    this._preventUpdates = v
    // console.log(v ? "Preventing updates: STARTED" : "Preventing updates: STOPPED")
  }
  getImageData(){
    return this.props.asset.thumbnail
  }

  setInitialStateFromContent(){
    if(Object.keys(this.props.asset.content2).length == 0){
      this.createNewMap()
      return;
    }
    this.cache = new Cache(this.props.asset.content2, () => {
      this.setState({isLoading:  false})
    })

    /* HERE we will store temporary changes to map
      some tools don't report changes instantly -
      so it goes out of sync with with props,
      but that allows to avoid heavy re-redering of all components..
      in the end UX is better.
      e.g. while inserting multiple tiles.. or drawing multiple tiles with stamp tool - update will trigger only once - when users releases mouse
      it's possible to use _.copyDeep - in case of some unexpected behavior,
      but I haven't experienced strange behavior.. ref is much faster
     */
    this.mgb_content2 = this.props.asset.content2

    // restore last edit mode ???
    this.state.editMode = this.options.mode
    this.state.randomMode = this.options.randomMode
    this.state.showGrid = this.options.showGrid
  }

  createNewMap(){
    this.mgb_content2 = TileHelper.genNewMap(10, 10)
    this.cache = new Cache(this.mgb_content2, () => {
      // unmounted during cache fetching
      if(!this.cache){
        return
      }
      this.quickSave("New Map data")
      // this is called in the construct - and callback will be instant
      this.setState({isLoading: false})
    })
  }

  updateMapData(data = this.mgb_content2, reason = "Imported map"){
    this.mgb_content2 = data
    this.cache.update(this.mgb_content2, () => {
      this.quickSave(reason)
      // this is called in the construct - and callback will be instant
      this.setState({isLoading: false})
    })
  }

  get meta() {
    // make sure we have options object - older maps don't have it
    if(!this.mgb_content2.meta || !this.mgb_content2.meta.options){
      this.mgb_content2.meta = {
        options: {
          // empty maps aren't visible without grid
          showGrid: 1,
          camera: { _x: 0, _y: 0, _zoom: 1 },
          preview: false,
          mode: 'stamp',
          randomMode: false
        }
      }
    }
    return this.mgb_content2.meta
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

  shouldComponentUpdate() {
    return !this.preventUpdates
  }

  componentWillReceiveProps(newp){
    // new props will come in after we will save just edited data - throw away data this time
    if(this.preventUpdates){
      return
    }
    // sometimes we are getting empty c2 on new maps
    if(newp.asset.content2 && Object.keys(newp.asset.content2).length ) {
      this.setState({isLoading: true})
      // or new Cache - if immutable is preferred - and need to force full cache update
      this.cache.update(newp.asset.content2, () => {
        this.setState({isLoading: false})
      })
      if(!this.props.hasUnsentSaves && !this.props.asset.isUnconfirmedSave){
        if(this.props.canEdit){
          const oldMeta = this.mgb_content2.meta
          this.mgb_content2 = newp.asset.content2
          // don't update active tool / camera position etc - because it's annoying
          this.mgb_content2.meta = oldMeta
        }
        else{
          this.mgb_content2 = newp.asset.content2
        }
      }
    }
  }

  componentWillUnmount(){
    this.cache && this.cache.cleanUp()
    this.cache = null
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
    // this will prevent update between editing step and next save
    this.preventUpdates = true
    if (this.ignoreUndo)
      return
    const toSave = { data: this.copyData(this.mgb_content2), reason }
    const undo = this.mgb_undo;
    // prevent double saving undo
    if (undo.length && undo[undo.length - 1].data == toSave.data)
      return

    if (!skipRedo)
      this.mgb_redo.length = 0

    undo.push(toSave)
    if(undo.length > SpecialGlobals.map.maxUndoSteps){
      undo.shift()
    }
    this.setState({undo})
  }
  doUndo () {
    if (!this.mgb_undo.length)
      return
    const pop = this.mgb_undo.pop()
    // save current state
    const toSave = {
      data: this.copyData(this.mgb_content2),
      reason: pop.reason
    }

    this.mgb_redo.push(toSave)
    const data = JSON.parse(pop.data)

    // make sure cached GIDs matches actual gids
    this.cache.update(data)

    this.handleSave(data, "Undo " + pop.reason, void(0), true)
    // we need to set state here because handle save callback will match with last save and nothing will get updated

    this.mgb_content2 = data
    this.refs.map && this.refs.map.clearSelection()

    this.setState({content2: data})
  }
  doRedo () {
    if (!this.mgb_redo.length)
      return

    const pop = this.mgb_redo.pop()
    const toSave = {
      data: this.copyData(this.mgb_content2),
      reason: pop.reason
    }

    this.mgb_undo.push(toSave)
    const data = JSON.parse(pop.data)

    // make sure cached GIDs matches actual gids
    this.cache.update(data)
    this.handleSave(data, "Redo " + pop.reason, void(0), true)
    // same reason as undo...

    this.mgb_content2 = data
    this.refs.map && this.refs.map.clearSelection()

    this.setState({content2: data})
  }

  enableMode(mode){
    // this seems a little bit strange - state and props have same variable
    // probably state should hold only props.options ?
    this.options.mode = mode
    this.setState({editMode: mode})
  }

  handleSave (data, reason, thumbnail, skipUndo = false) {
    this.preventUpdates = false
    if(!this.props.canEdit){
      this.props.editDeniedReminder()
      return
    }
    // isn't it too late to save for undo?
    /*if(!skipUndo && !_.isEqual(this.lastSave, data)){
      this.saveForUndo(reason)
    }*/
    // make sure we have thumbnail
    if(!thumbnail && this.refs.map){
      this.refs.map.generatePreviewAndSaveIt()
    }
    this.props.handleContentChange(data, thumbnail, reason)
  }

  quickSave(reason = "noReason", skipUndo = true, thumbnail = null){
    return this.handleSave(this.mgb_content2, reason, thumbnail, skipUndo)
  }

  // probably copy of data would be better to hold .. or not research strings vs objects
  // TODO(stauzs): research memory usage - strings vs JS objects
  copyData = (data) => {
    return JSON.stringify(data)
  }

  renderLoading () {
    return <div className="loading-notification">Working in background...</div>
  }

  render () {
    if(!this.mgb_content2 || !this.cache){
      return null
    }
    const c2 = this.mgb_content2
    return (
      <div className='ui grid'>
        { this.state.isLoading && this.renderLoading()}
        <div className='ten wide column'>
          <MapToolbar
            {...this.toolbarProps}
            options={this.options}
            undoSteps={this.mgb_undo}
            redoSteps={this.mgb_redo}
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
            <br />
            <Properties
              {...this.propertiesProps}
              data={this.mgb_content2}

              map={{
                width: c2.width,
                height: c2.height,
                tilewidth: c2.tilewidth,
                tileheight: c2.tileheight
              }}
              tileset={c2.tilesets[this.state.activeTileset]}
              layer={c2.layers[this.state.activeLayer]}
              />
            <br />
            <ObjectList
              {...this.objectListProps}
              activeObject={this.state.activeObject}
              data={this.mgb_content2}
              layer={c2.layers[this.state.activeLayer]}
              />
        </div>
      </div>
    )
  }
}
