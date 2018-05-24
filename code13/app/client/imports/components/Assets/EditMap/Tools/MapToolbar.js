import _ from 'lodash'
import React from 'react'
import EditModes from '../../Common/Map/Tools/EditModes'
import LayerTypes from '../../Common/Map/Tools/LayerTypes'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import CameraTools from '../../Common/Map/Tools/CameraTools'

export default class MapToolbar extends React.Component {
  render() {
    // older maps don't have default mode
    if (!this.props.options.mode) this.props.options.mode = EditModes.stamp

    const layer = this.props.getActiveLayer()
    const config = {
      //  level: 3,     // default level -- This is now in expectedToolbars.getDefaultLevel
      buttons: [
        {
          name: 'save',
          label: 'Save',
          tooltip: 'Save the map (auto save is ON)',
          level: 1,
          shortcut: 'Ctrl+S', // Is it OK to override browsers save page?
        },
        {
          name: 'separator',
        },
        {
          name: 'undo',
          label: 'Undo',
          iconText: this.props.undoSteps.length ? ' ' + this.props.undoSteps.length : '',
          disabled: !this.props.undoSteps.length,
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
          disabled: !this.props.redoSteps.length,
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
        },
        {
          name: 'zoomIn',
          icon: 'zoom in',
          label: 'Zoom in map',
          tooltip:
            'Click here or SHIFT + mousewheel over map area to change zoom level. Use mousewheel to scroll if the zoom is too large',
          shortcut: 'Shift+PLUS',
          level: 7,
        },
        {
          component: CameraTools,
          iconText: `${(this.props.options.camera.zoom * 100).toFixed(1)}%`,
          resetCamera: this.props.resetCamera,
          fitMap: this.props.fitMap,
          fitMapH: this.props.fitMapH,
          fitMapV: this.props.fitMapV,
        },
        {
          name: 'zoomOut',
          icon: 'zoom out',
          label: 'Zoom out map',
          tooltip:
            'Click here or SHIFT + mousewheel over map area to change zoom level. Use mousewheel to scroll if the zoom is too large',
          shortcut: 'Shift+MINUS',
          level: 7,
        },
        {
          name: 'preview',
          label: '3D View',
          icon: 'cube',
          active: this.props.options.preview,
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
          active: this.props.options.mode === EditModes.view,
          label: 'View',
          tooltip: 'Allows to scroll map in the mobile mode',
          level: 1,
          shortcut: 'V',
        },
        {
          name: 'stamp',
          icon: 'legal stamp',
          active: this.props.options.mode === EditModes.stamp,
          label: 'Stamp',
          tooltip: 'Stamp tiles on the map',
          level: 1,
          shortcut: 'S',
        },
        {
          name: 'toggleRandomMode',
          icon: 'random',
          active: this.props.options.randomMode,
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type),
          label: 'Random mode',
          tooltip: 'Random Mode - picks one tile from the selection',
          level: 11,
        },
        /*{
          name: 'terrain',
          icon: 'world terrain',
          active: this.props.options.mode === EditModes.terrain,
          disabled: (!layer || !LayerTypes.isTilemapLayer(layer.type)),
          label: 'Terrain Tool',
          tooltip: 'Create advanced Terrains - not implemented :(',
          level: 26,
          shortcut: 'T'
        },*/
        {
          name: 'fill',
          icon: 'theme fill',
          label: 'Fill',
          active: this.props.options.mode === EditModes.fill,
          disabled: !layer || !LayerTypes.isTilemapLayer(layer.type),
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
          active: this.props.options.mode === EditModes.eraser,
          tooltip: 'Delete tile - or use [Ctrl + click] to quickly access this tool',
          disabled: !layer || layer.type !== LayerTypes.tile,
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
          active: this.props.options.mode === EditModes.rectangle,
          tooltip: 'Rectangle Selection Tool',
          level: 3,
          shortcut: 'Ctrl + Shift + R',
        },
        {
          name: 'wand',
          icon: 'wizard',
          active: this.props.options.mode === EditModes.wand,
          label: 'Magic Wand',
          tooltip: 'Magic Wand selection - select adjacent tiles with same ID',
          disabled: !layer || layer.type !== LayerTypes.tile,
          level: 12,
        },
        {
          name: 'picker',
          active: this.props.options.mode === EditModes.picker,
          icon: 'qrcode picker',
          label: 'Tile Picker',
          tooltip: 'Tile Picker - Select All tiles with same ID',
          disabled: !layer || layer.type !== LayerTypes.tile,
          level: 13,
        },
        {
          name: 'clearSelection',
          icon: 'ban',
          label: 'Clear Selection',
          tooltip: 'Clear selected tiles and/or objects',
          level: 4,
        },
        {
          name: 'separator',
        },

        {
          name: 'drawRectangle',
          active: this.props.options.mode === EditModes.drawRectangle,
          icon: 'stop',
          label: 'Rectangle',
          tooltip: 'Draw Rectangle on the map',
          disabled: !layer || layer.type !== LayerTypes.object,
          shortcut: 'Shift+R',
          level: 17,
        },
        {
          name: 'drawEllipse',
          active: this.props.options.mode === EditModes.drawEllipse,
          icon: 'circle',
          label: 'Ellipse',
          tooltip: 'Draw Ellipse on the map',
          disabled: !layer || layer.type !== LayerTypes.object,
          shortcut: 'Shift+E',
          level: 18,
        },
        {
          name: 'drawShape',
          active: this.props.options.mode === EditModes.drawShape,
          icon: 'empire',
          label: 'Shape',
          tooltip: 'Draw Shape on the map',
          disabled: !layer || layer.type !== LayerTypes.object,
          shortcut: 'Shift+S',
          level: 19,
        },
        {
          name: 'togglePolygon',
          icon: 'connectdevelop',
          label: 'Polygon',
          tooltip: 'Toggle between polygon and polyline',
          disabled: !layer || layer.type !== LayerTypes.object,
          shortcut: 'Shift+P',
          level: 20,
        },
        {
          name: 'separator',
        },
        {
          name: 'toggleCtrlModifier',
          active: this.props.options.ctrlModifier,
          icon: 'asterisk',
          label: 'Ctrl Modifier',
          tooltip: 'Ctrl key on mobile devices. Allows to enable Snap To Grid',
          shortcut: 'Ctrl',
          level: 20,
        },
        { name: 'separator' },
        {
          name: 'rotateClockwise',
          icon: 'share',
          label: 'Rotate (CW)',
          tooltip: 'Rotate Tile ClockWise',
          shortcut: 'Z',
          disabled: !layer || layer.type === LayerTypes.object,
          level: 20,
        },
        {
          name: 'rotateCounterClockwise',
          icon: 'reply',
          label: 'Rotate (CCW)',
          tooltip: 'Rotate Tile Counter ClockWise',
          shortcut: 'Shift+Z',
          disabled: !layer || layer.type === LayerTypes.object,
          level: 22,
        },
        {
          name: 'flip',
          icon: 'exchange',
          label: 'Flip Tile',
          tooltip: 'Mirror tile',
          shortcut: 'X',
          disabled: !layer || layer.type === LayerTypes.object,
          level: 23,
        },
      ],
    }

    return <Toolbar actions={this.props} config={config} className="map-tools" name="MapTools" />
  }
}
