import _ from 'lodash'
import React from 'react'
import EditModes from '../../Common/Map/Tools/EditModes'
import LayerTypes from '../../Common/Map/Tools/LayerTypes'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import Properties from './ActorMapProperties'

import CameraTools from '../../Common/Map/Tools/CameraTools'

export default class MapToolbar extends React.Component {
  render() {
    // older maps don't have default mode
    if (!this.props.options.mode) {
      this.props.options.mode = EditModes.stamp
    }
    const disabled = this.props.isPlaying

    const layer = this.props.getActiveLayer()

    const config = {
      // vertical: true,
      // level: 3,  -- This is now in expectedToolbars.getDefaultLevel
      buttons: [
        {
          name: 'save',
          label: 'Save',
          tooltip: 'Save the map (auto save is ON)',
          level: 1,
          disabled,
          shortcut: 'Ctrl+S', // Is it OK to override browsers save page?
        },
        {
          name: 'play',
          icon: this.props.isPlaying ? 'stop' : 'play',
          label: 'Play',
          tooltip: this.props.isPlaying ? 'Stop playing / Return to map editing' : 'Play this map',
          level: 1,
          shortcut: 'Ctrl+Enter',
        },
        {
          name: 'separator',
        },
        {
          name: 'undo',
          label: 'Undo',
          iconText: this.props.undoSteps.length ? ' ' + this.props.undoSteps.length : '',
          disabled: !this.props.undoSteps.length || disabled,
          tooltip:
            'Undo last action' +
            (_.last(this.props.undoSteps) ? ': ' + _.last(this.props.undoSteps).reason : ''),
          level: 2,
          shortcut: 'Ctrl+Z',
        },
        {
          name: 'redo',
          icon: 'undo flip', // redo is flipped undo
          label: 'Redo',
          disabled: !this.props.redoSteps.length || disabled,
          tooltip: 'Redo previous action',
          level: 2,
          shortcut: 'Ctrl+Shift+Z',
        },
        {
          name: 'separator',
        },
        {
          name: 'showGridToggle',
          icon: 'grid layout',
          label: this.props.options.showGrid ? 'Hide Grid' : 'Show Grid',
          tooltip: 'Toggle grid visibilty on / off',
          level: 3,
          active: this.props.options.showGrid,
          shortcut: 'Alt+G',
          disabled,
        },
        {
          name: 'zoomIn',
          icon: 'zoom in',
          label: 'Zoom in map',
          tooltip:
            'Click here or SHIFT + mousewheel over map area to change zoom level. Use mousewheel to scroll if the zoom is too large',
          shortcut: 'Shift+PLUS',
          level: 7,
          disabled,
        },
        /*
        {
          name: 'resetCamera',
          icon: 'crosshairs',
          iconText:  disabled ? '100%' : `${(this.props.options.camera.zoom * 100).toFixed(0)}%`,
          label: 'Reset Camera',
          tooltip: 'Set Zoom to 100% and move map to 0,0 coordinates',
          disabled,
          level: 6,
          shortcut: 'Ctrl+Alt+R'
        },
        */
        {
          component: CameraTools,
          iconText: `${(this.props.options.camera.zoom * 100).toFixed(1)}%`,
          resetCamera: this.props.resetCamera,
          fitMap: this.props.fitMap,
          fitMapH: this.props.fitMapH,
          fitMapV: this.props.fitMapV,
          disabled: this.props.isPlaying,
        },
        {
          name: 'zoomOut',
          icon: 'zoom out',
          label: 'Zoom out map',
          tooltip:
            'Click here or SHIFT + mousewheel over map area to change zoom level. Use mousewheel to scroll if the zoom is too large',
          shortcut: 'Shift+MINUS',
          level: 7,
          disabled,
        },
        {
          name: 'preview',
          label: '3D View',
          icon: 'cube',
          active: this.props.options.preview,
          disabled,
          tooltip: 'Separate and pivot map layers in 3D view. Use center-click+drag mouse to spin map',
          level: 9,
          shortcut: 'Ctrl+Alt+P',
        },
        {
          name: 'separator',
        },
        {
          name: 'view',
          icon: 'mouse pointer',
          active: this.props.options.mode == EditModes.view,
          disabled,
          label: 'View',
          tooltip: 'Allows to scroll map in the mobile mode',
          level: 1,
          shortcut: 'V',
        },
        {
          name: 'stamp',
          icon: 'legal stamp',
          active: this.props.options.mode == EditModes.stamp,
          disabled,
          label: 'Stamp',
          tooltip: 'Stamp tiles on the map',
          level: 1,
          shortcut: 'S',
        },
        {
          name: 'fill',
          icon: 'theme fill',
          label: 'Fill',
          active: this.props.options.mode == EditModes.fill,
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type) || this.props.isPlaying,
          tooltip: 'Fill Map or Selection with selected tile(s)',
          level: 6,
          shortcut: 'F',
        },
        {
          name: 'separator',
        },
        {
          name: 'eraser',
          label: 'Eraser',
          active: this.props.options.mode == EditModes.eraser,
          tooltip: 'Delete tile - or use [Ctrl + click] to quickly access this tool',
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type) || this.props.isPlaying,
          level: 1,
          shortcut: 'E',
        },
        {
          name: 'separator',
        },
        {
          name: 'rectangle',
          icon: 'square outline rectangle',
          label: 'Select',
          active: this.props.options.mode == EditModes.rectangle,
          disabled,
          tooltip: 'Rectangle Selection Tool',
          level: 3,
          shortcut: 'Ctrl + Shift + R',
        },
        {
          name: 'wand',
          icon: 'wizard',
          active: this.props.options.mode == EditModes.wand,
          label: 'Magic Wand',
          tooltip: 'Magic Wand selection - Select adjacent tiles with same ID',
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type) || this.props.isPlaying,
          level: 12,
        },
        {
          name: 'picker',
          active: this.props.options.mode == EditModes.picker,
          icon: 'qrcode picker',
          label: 'Tile Picker',
          tooltip: 'Tile Picker - Select all tiles with same ID',
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type) || this.props.isPlaying,
          level: 13,
        },
        {
          name: 'clearSelection',
          icon: 'ban',
          label: 'Clear Selection',
          tooltip: 'Clear selected tiles and/or objects',
          level: 4,
          disabled,
        },
      ],
    }

    return <Toolbar actions={this.props} config={config} className="map-tools" name="MapTools" />
  }
}
