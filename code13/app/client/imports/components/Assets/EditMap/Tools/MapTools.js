"use strict";
import React from 'react';
import EditModes from "./EditModes";
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js';

export default class MapTools extends React.Component {

  preview() {
    this.props.map.togglePreviewState();
  }

  save(e) {
    this.props.map.props.parent.handleSave(e);
  }

  resetCamera() {
    this.props.map.resetCamera();
  }
  undo(){
    this.props.map.doUndo();
    this.forceUpdate();
  }
  redo(){
    this.props.map.doRedo();
    this.forceUpdate();
  }
  toggleRandomMode(){
    this.props.map.options.randomMode = !this.props.map.options.randomMode;
    this.forceUpdate();
  }
  stamp(){
    this.enableMode(EditModes.stamp);
  }
  terrain(){
    this.enableMode(EditModes.terrain);
  }
  fill(){
    this.enableMode(EditModes.fill);
  }
  eraser(){
    this.enableMode(EditModes.eraser);
  }
  drawRectangle(){
    this.enableMode(EditModes.drawRectangle);
  }
  drawEllipse(){
    this.enableMode(EditModes.drawEllipse);
  }
  drawShape(){
    this.enableMode(EditModes.drawShape);
  }
  rectangle(){
    this.enableMode(EditModes.rectangle);
  }
  wand(){
    this.enableMode(EditModes.wand);
  }
  picker(){
    this.enableMode(EditModes.picker);
  }
  enableMode(mode){
    this.props.map.options.mode = mode;
    this.forceUpdate();
  }
  enableEraser(){
    this.enableMode(EditModes.eraser);
    this.props.map.selection.clear();
    this.props.map.collection.clear();
    this.props.map.redrawTilesets();
  }
  clearSelection(){
    this.props.map.tmpSelection.clear();
    this.props.map.selection.clear();
    this.props.map.collection.clear();
    this.props.map.redraw();
    const l = this.props.map.getActiveLayer();
    if(!l || !l.clearSelection){return;}
    l.clearSelection();
  }
  togglePolygon(){
    const l = this.props.map.getActiveLayer();
    if(!l || !l.clearSelection){return;}
    l.toggleFill();
  }
  rotateClockwise(){
    this.rotate(true);
  }
  rotateCounterClockwise(){
    this.rotate(false);
  }
  rotate(cw){
    const l = this.props.map.getActiveLayer();
    if(!l || !l.rotate){return;}
    if(cw){
      l.rotate();
    }
    else{
      l.rotateBack();
    }
  }
  showGridToggle(){
    this.props.map.options.showGrid = !this.props.map.options.showGrid;
    this.props.map.forceUpdate();
  }

  render() {
    // older maps don't have default mode
    if(!this.props.map.options.mode){
      this.props.map.options.mode = EditModes.stamp;
    }

    var config = {
      level: 5,
      buttons: [
        {
          name: "save",
          label: "Save",
          tooltip: "Save the map",
          level: 1,
          shortcut: "Ctrl+S" // Is it OK to override browsers save page?
        },
        {
          name: "separator"
        },
        {
          name: "preview",
          label: "3D Preview",
          icon: "cube",
          active: this.props.map.options.preview,
          tooltip: "Separate layers in 3d view",
          level: 5,
          shortcut: "Ctrl+Alt+P"
        },
        {
          name: "resetCamera",
          icon: "crosshairs",
          label: "Reset Camera",
          tooltip: "Set Zoom to 100% and move map to 0,0 coordinates",
          level: 5,
          shortcut: "Ctrl+Alt+R"
        },
        {
          name: "showGridToggle",
          icon: "grid layout",
          title: this.props.map.options.showGrid ? "Hide Grid" : "Show Grid",
          level: 4,
          active: this.props.map.options.showGrid,
          shortcut: "Alt+G"
        },
        {
          name: "separator"
        },
        {
          name: "undo",
          label: "Undo",
          iconText:  (this.props.map.undoSteps.length ? " "+this.props.map.undoSteps.length : ''),
          disabled: !this.props.map.undoSteps.length,
          tooltip: "Undo last action" + (_.last(this.props.map.undoSteps) ? ": " + _.last(this.props.map.undoSteps).reason : ''),
          level: 2,
          shortcut: "Ctrl+Z"
        },
        {
          name: "redo",
          icon: "undo flip", // redo is flipped undo
          label: "Redo",
          disabled: !this.props.map.redoSteps.length,
          tooltip: "Redo previous action",
          level: 2,
          shortcut: "Ctrl+Shift+Z"
        },
        {
          name: "separator"
        },
        {
          name: "toggleRandomMode",
          icon: "random",
          active: this.props.map.options.randomMode,
          label: "Random mode",
          tooltip: "Random Mode - picks one tile from the selection",
          level: 5
        },
        {
          name: "separator"
        },
        {
          name: "stamp",
          icon: "legal stamp",
          active: this.props.map.options.mode == EditModes.stamp,
          label: "Stamp",
          tooltip: "Stamp tiles on the map",
          level: 1,
          shortcut: "S"
        },
        {
          name: "terrain",
          icon: "world terrain",
          active: this.props.map.options.mode == EditModes.terrain,
          label: "Terrain Tool",
          tooltip: "Create advanced Terrains - not implemented :(",
          level: 9,
          shortcut: "T"
        },
        {
          name: "fill",
          icon: "theme fill",
          label: "Fill",
          active: this.props.map.options.mode == EditModes.fill,
          tooltip: "Fill Map or Selection with selected tile(s)",
          level: 4,
          shortcut: "F"
        },
        {
          name: "eraser",
          label: "Eraser",
          active: this.props.map.options.mode == EditModes.eraser,
          tooltip: "Delete tile - or use [Ctrl + click] to quickly access this tool",
          level: 1,
          shortcut: "E"
        },
        {
          name: "separator"
        },
        {
          name: "rectangle",
          icon: "square outline rectangle",
          label: "Select",
          active: this.props.map.options.mode == EditModes.rectangle,
          tooltip: "Rectangle Selection Tool",
          level: 3,
          shortcut: "Ctrl + Shift + R"
        },
        {
          name: "wand",
          icon: "wizard",
          active: this.props.map.options.mode == EditModes.wand,
          label: "Magic Wand",
          tooltip: "Magic Wand selection - select adjacent tiles with same ID",
          level: 5
        },
        {
          name: "picker",
          active: this.props.map.options.mode == EditModes.picker,
          icon: "qrcode picker",
          label: "Tile Picker",
          tooltip: "Tile Picker - Select All tiles with same ID",
          level: 5
        },
        {
          name: "clearSelection",
          icon: "ban",
          label: "Clear Selection",
          tooltip: "Clear selected tiles and/or objects",
          level: 3
        },
        {
          name: "separator"
        },
        {
          name: "rotateClockwise",
          icon: "share",
          label: "Rotate (CW)",
          tooltip: "Rotate Tile ClockWise",
          shortcut: "Z",
          level: 7
        },
        {
          name: "rotateCounterClockwise",
          icon: "reply",
          label: "Rotate (CCW)",
          tooltip: "Rotate Tile Counter ClockWise",
          shortcut: "Shift+Z",
          level: 7
        },
        {
          name: "separator"
        },
        {
          name: "drawRectangle",
          active: this.props.map.options.mode == EditModes.drawRectangle,
          icon: "stop",
          label: "Rectangle",
          tooltip: "Draw Rectangle on the map",
          shortcut: "Shift+R",
          level: 3
        },
        {
          name: "drawEllipse",
          active: this.props.map.options.mode == EditModes.drawEllipse,
          icon: "circle",
          label: "Ellipse",
          tooltip: "Draw Ellipse on the map",
          shortcut: "Shift+E",
          level: 4
        },
        {
          name: "drawShape",
          active: this.props.map.options.mode == EditModes.drawShape,
          icon: "pencil",
          label: "Shape",
          tooltip: "Draw Shape on the map",
          shortcut: "Shift+S",
          level: 5
        },
        {
          name: "togglePolygon",
          icon: "clone",
          label: "Polygon",
          tooltip: "Toggle between polygon and polyline",
          shortcut: "Shift+P",
          level: 5
        }
      ]
    };

    return <Toolbar actions={this} config={config} className="map-tools" name="MapTools" />
  }


  testSample(){


    class SampleComponent extends React.Component {
      render(){
        return <div className="button ui">{"Sample " + this.props.name}</div>;
      }
    }

    const actions = {
      save: () => {
        alert("Saved!");
      },
      undo: () => {
        alert("redo!");
      }
    };

    const aconf = {
      level: 2,
      buttons: [
        {
          name: "stamp",
          label: "Stamp Tool",
          tooltip: "Put tile on the map",
          level: 3
        }
        ,{
          name: "terrain",
          label: "Terrain Tool",
          tooltip: "Terrain Tool",
          level: 9
        }
      ]
    };

    const config = {
      level: 2,
      buttons: [
        {
          name: "save",
          label: "Save",
          tooltip: "Press this button to save...",
          level: 1,
          shortcut: "Ctrl+A"
        }
        ,{
          name: "undo",
          label: "Undo",
          tooltip: "Restore previous state",
          level: 2
        }
        ,{
          name: "redo",
          label: "Redo",
          icon: "undo redo",
          tooltip: "Revert last undo action",
          level: 2
        }
        ,{
          name: "component",
          component: <SampleComponent name="Hello!" key="component" />
        }
        ,{
          name: "anotherToolbar",
          component: <Toolbar actions={actions} config={aconf} key="anotherToolbar" />
        }
      ]
    };
    return <Toolbar actions={actions} config={config} className="maparea" />;
  }
}
