'use strict'
import _ from 'lodash'
import React from 'react'
import EditModes from './EditModes'
import LayerTypes from './LayerTypes.js'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'

export default class MapToolbar extends React.Component {

  preview () {
    this.props.map.togglePreviewState()
  }

  save (e) {
    // force to update thumbnail
    this.props.map.save('Save Map', true)
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
  flip (){
    const l = this.props.map.getActiveLayer()
    if (!l || !l.rotate) {return;}
    l.flip()
  }
  showGridToggle () {
    this.props.map.options.showGrid = !this.props.map.options.showGrid
    this.props.map.forceUpdate()
  }

  render () {
    // older maps don't have default mode
    if (!this.props.map.options.mode) {
      this.props.map.options.mode = EditModes.stamp
    }

    const layer = this.props.map.getActiveLayer()
    const config = {
      level: 3,
      buttons: [
        {
          name: 'save',
          label: 'Save',
          tooltip: 'Save the map (auto save is ON)',
          level: 1,
          shortcut: 'Ctrl+S' // Is it OK to override browsers save page?
        },
        {
          name: 'separator'
        },
        {
          name: 'undo',
          label: 'Undo',
          iconText: (this.props.map.undoSteps.length ? ' ' + this.props.map.undoSteps.length : ''),
          disabled: !this.props.map.undoSteps.length,
          tooltip: 'Undo last action' + (_.last(this.props.map.undoSteps) ? ': ' + _.last(this.props.map.undoSteps).reason : ''),
          level: 2,
          shortcut: 'Ctrl+Z' 
        },
        {
          name: 'redo',
          icon: 'undo flip', // redo is flipped undo
          label: 'Redo',
          disabled: !this.props.map.redoSteps.length,
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
          shortcut: 'Alt+G'
        },
        {
          name: 'resetCamera',
          icon: 'crosshairs',
          label: 'Reset Camera',
          tooltip: 'Set Zoom to 100% and move map to 0,0 coordinates',
          level: 6,
          shortcut: 'Ctrl+Alt+R'
        },
        {
          name: 'preview',
          label: '3D View',
          icon: 'cube',
          active: this.props.map.options.preview,
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
          label: 'Stamp',
          tooltip: 'Stamp tiles on the map',
          level: 1,
          shortcut: 'S'
        },
        {
          name: 'toggleRandomMode',
          icon: 'random',
          active: this.props.map.options.randomMode,
          label: 'Random mode',
          tooltip: 'Random Mode - picks one tile from the selection',
          level: 11
        },
        {
          name: 'terrain',
          icon: 'world terrain',
          active: this.props.map.options.mode == EditModes.terrain,
          disabled: (!layer || layer.kind != LayerTypes.tile),
          label: 'Terrain Tool',
          tooltip: 'Create advanced Terrains - not implemented :(',
          level: 26,
          shortcut: 'T'
        },
        {
          name: 'fill',
          icon: 'theme fill',
          label: 'Fill',
          active: this.props.map.options.mode == EditModes.fill,
          disabled: (!layer || layer.kind != LayerTypes.tile),
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
          disabled: (!layer || layer.kind != LayerTypes.tile),
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
          disabled: (!layer || layer.kind != LayerTypes.tile),
          level: 12
        },
        {
          name: 'picker',
          active: this.props.map.options.mode == EditModes.picker,
          icon: 'qrcode picker',
          label: 'Tile Picker',
          tooltip: 'Tile Picker - Select All tiles with same ID',
          disabled: (!layer || layer.kind != LayerTypes.tile),
          level: 13
        },
        {
          name: 'clearSelection',
          icon: 'ban',
          label: 'Clear Selection',
          tooltip: 'Clear selected tiles and/or objects',
          level: 4
        },
        {
          name: 'separator'
        },

        {
          name: 'drawRectangle',
          active: this.props.map.options.mode == EditModes.drawRectangle,
          icon: 'stop',
          label: 'Rectangle',
          tooltip: 'Draw Rectangle on the map',
          disabled: (!layer || layer.kind != LayerTypes.object),
          shortcut: 'Shift+R',
          level: 17
        },
        {
          name: 'drawEllipse',
          active: this.props.map.options.mode == EditModes.drawEllipse,
          icon: 'circle',
          label: 'Ellipse',
          tooltip: 'Draw Ellipse on the map',
          disabled: (!layer || layer.kind != LayerTypes.object),
          shortcut: 'Shift+E',
          level: 18
        },
        {
          name: 'drawShape',
          active: this.props.map.options.mode == EditModes.drawShape,
          icon: 'empire',
          label: 'Shape',
          tooltip: 'Draw Shape on the map',
          disabled: (!layer || layer.kind != LayerTypes.object),
          shortcut: 'Shift+S',
          level: 19
        },
        {
          name: 'togglePolygon',
          icon: 'connectdevelop',
          label: 'Polygon',
          tooltip: 'Toggle between polygon and polyline',
          disabled: (!layer || layer.kind != LayerTypes.object),
          shortcut: 'Shift+P',
          level: 20
        },
        {
          name: 'separator'
        },
        {
          name: 'rotateClockwise',
          icon: 'share',
          label: 'Rotate (CW)',
          tooltip: 'Rotate Tile ClockWise',
          shortcut: 'Z',
          level: 20
        },
        {
          name: 'rotateCounterClockwise',
          icon: 'reply',
          label: 'Rotate (CCW)',
          tooltip: 'Rotate Tile Counter ClockWise',
          shortcut: 'Shift+Z',
          level: 22
        },
        {
          name: 'flip',
          icon: 'exchange',
          label: 'Flip Tile',
          tooltip: 'Mirror tile',
          shortcut: 'X',
          level: 23
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
