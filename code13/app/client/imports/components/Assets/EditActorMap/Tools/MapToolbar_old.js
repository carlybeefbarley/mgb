'use strict'
import _ from 'lodash'
import React from 'react'
import EditModes from './../../Common/Map/Tools/EditModes'
import LayerTypes from './../../Common/Map/Tools/LayerTypes.js'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'
export default class MapToolbar extends React.Component {

  preview () {
    this.props.map.togglePreviewState()
  }

  save (e) {
    // force to update thumbnail
    this.props.map.save('Save Map', true)
  }
  play (){
    //ActorHelper.v2_to_v1(this.props.map.data);
    this.props.map.setState({
      isPlaying: !this.props.map.state.isPlaying
    })
  }
  resetCamera () {
    this.props.map.resetCamera()
  }
  undo () {
    this.props.map.doUndo()
    this.forceUpdate()
  }
  redo () {
    this.props.map.doRedo()
    this.forceUpdate()
  }
  toggleRandomMode () {
    this.props.map.options.randomMode = !this.props.map.options.randomMode
    this.forceUpdate()
  }
  stamp () {
    this.enableMode(EditModes.stamp)
  }
  terrain () {
    this.enableMode(EditModes.terrain)
  }
  fill () {
    this.enableMode(EditModes.fill)
  }
  eraser () {
    this.enableMode(EditModes.eraser)
  }
  drawRectangle () {
    this.enableMode(EditModes.drawRectangle)
  }
  drawEllipse () {
    this.enableMode(EditModes.drawEllipse)
  }
  drawShape () {
    this.enableMode(EditModes.drawShape)
  }
  rectangle () {
    this.enableMode(EditModes.rectangle)
  }
  wand () {
    this.enableMode(EditModes.wand)
  }
  picker () {
    this.enableMode(EditModes.picker)
  }
  enableMode (mode) {
    this.props.map.options.mode = mode
    this.forceUpdate()
  }
  enableEraser () {
    this.enableMode(EditModes.eraser)
    this.props.map.selection.clear()
    this.props.map.collection.clear()
    this.props.map.redrawTilesets()
  }
  clearSelection () {
    this.props.map.tmpSelection.clear()
    this.props.map.selection.clear()
    this.props.map.collection.clear()
    this.props.map.redraw()
    const l = this.props.map.getActiveLayer()
    if (!l || !l.clearSelection) {return;}
    l.clearSelection(true)
  }
  togglePolygon () {
    const l = this.props.map.getActiveLayer()
    if (!l || !l.clearSelection) {return;}
    l.toggleFill()
    this.props.map.saveForUndo('Toggle Fill')
  }
  rotateClockwise () {
    this.rotate(true)
  }
  rotateCounterClockwise () {
    this.rotate(false)
  }
  rotate (cw) {
    const l = this.props.map.getActiveLayer()
    if (!l || !l.rotate) {return;}
    if (cw) {
      l.rotate()
    }else {
      l.rotateBack()
    }
  }
  flip () {
    const l = this.props.map.getActiveLayer()
    if (!l || !l.rotate) {return;}
    l.flip()
  }
  showGridToggle () {
    this.props.map.options.showGrid = !this.props.map.options.showGrid
    this.props.map.forceUpdate()
  }
  resetMap(){
    this.props.map.resetMap()
  }
  render () {
    // older maps don't have default mode
    if (!this.props.map.options.mode) {
      this.props.map.options.mode = EditModes.stamp
    }

    const layer = this.props.map.getActiveLayer()
    const disabled = this.props.map.state.isPlaying
    const config = {
      level: 3,
      buttons: [
        {
          name: 'save',
          label: 'Save',
          tooltip: 'Save the map (auto save is ON)',
          level: 1,
          disabled: this.props.map.state.isPlaying,
          shortcut: 'Ctrl+S' // Is it OK to override browsers save page?
        },
        {
          name: 'play',
          icon: this.props.map.state.isPlaying ? 'stop' : 'play',
          label: 'Play',
          tooltip: 'Play this map',
          level: 1,
          shortcut: 'Ctrl+P' // Is it OK to override browsers print page?
        },
        {
          name: 'separator'
        },
        {
          name: 'undo',
          label: 'Undo',
          iconText: (this.props.map.undoSteps.length ? ' ' + this.props.map.undoSteps.length : ''),
          disabled: !this.props.map.undoSteps.length || this.props.map.state.isPlaying,
          tooltip: 'Undo last action' + (_.last(this.props.map.undoSteps) ? ': ' + _.last(this.props.map.undoSteps).reason : ''),
          level: 2,
          shortcut: 'Ctrl+Z'
        },
        {
          name: 'redo',
          icon: 'undo flip', // redo is flipped undo
          label: 'Redo',
          disabled: !this.props.map.redoSteps.length || this.props.map.state.isPlaying,
          tooltip: 'Redo previous action',
          level: 2,
          shortcut: 'Ctrl+Shift+Z'
        },
        {
          name: 'separator'
        },
        {
          name: 'showGridToggle',
          icon: 'grid layout',
          label: this.props.map.options.showGrid ? 'Hide Grid' : 'Show Grid',
          tooltip: 'Toggle grid visibilty on / off',
          level: 3,
          active: this.props.map.options.showGrid,
          disabled: this.props.map.state.isPlaying,
          shortcut: 'Alt+G'
        },
        {
          name: 'resetCamera',
          icon: 'crosshairs',
          label: 'Reset Camera',
          tooltip: 'Set Zoom to 100% and move map to 0,0 coordinates',
          disabled: this.props.map.state.isPlaying,
          level: 6,
          shortcut: 'Ctrl+Alt+R'
        },
        {
          name: 'preview',
          label: '3D View',
          icon: 'cube',
          active: this.props.map.options.preview,
          disabled: this.props.map.state.isPlaying,
          tooltip: 'Separate and pivot map layers in 3D view. Use center-click+drag mouse to spin map',
          level: 9,
          shortcut: 'Ctrl+Alt+P'
        },
        {
          name: 'separator'
        },
        {
          name: 'stamp',
          icon: 'legal stamp',
          active: this.props.map.options.mode == EditModes.stamp,
          disabled: this.props.map.state.isPlaying,
          label: 'Stamp',
          tooltip: 'Stamp tiles on the map',
          level: 1,
          shortcut: 'S'
        },
        {
          name: 'fill',
          icon: 'theme fill',
          label: 'Fill',
          active: this.props.map.options.mode == EditModes.fill,
          disabled: (!layer || layer.kind != LayerTypes.tile || this.props.map.state.isPlaying),
          tooltip: 'Fill Map or Selection with selected tile(s)',
          level: 6,
          shortcut: 'F'
        },
        {
          name: 'separator'
        },
        {
          name: 'eraser',
          label: 'Eraser',
          active: this.props.map.options.mode == EditModes.eraser,
          tooltip: 'Delete tile - or use [Ctrl + click] to quickly access this tool',
          disabled: (!layer || layer.kind != LayerTypes.tile || this.props.map.state.isPlaying),
          level: 1,
          shortcut: 'E'
        },
        {
          name: 'separator'
        },
        {
          name: 'rectangle',
          icon: 'square outline rectangle',
          label: 'Select',
          active: this.props.map.options.mode == EditModes.rectangle,
          disabled,
          tooltip: 'Rectangle Selection Tool',
          level: 3,
          shortcut: 'Ctrl + Shift + R'
        },
        {
          name: 'wand',
          icon: 'wizard',
          active: this.props.map.options.mode == EditModes.wand,
          label: 'Magic Wand',
          tooltip: 'Magic Wand selection - select adjacent tiles with same ID',
          disabled: (!layer || layer.kind != LayerTypes.tile || this.props.map.state.isPlaying),
          level: 12
        },
        {
          name: 'picker',
          active: this.props.map.options.mode == EditModes.picker,
          icon: 'qrcode picker',
          label: 'Tile Picker',
          tooltip: 'Tile Picker - Select All tiles with same ID',
          disabled: (!layer || layer.kind != LayerTypes.tile || this.props.map.state.isPlaying),
          level: 13
        },
        {
          name: 'clearSelection',
          icon: 'ban',
          label: 'Clear Selection',
          tooltip: 'Clear selected tiles and/or objects',
          level: 4,
          disabled
        }
      ]
    }

    return <Toolbar
             actions={this}
             config={config}
             className='map-tools'
             name='MapTools' />
  }

}
