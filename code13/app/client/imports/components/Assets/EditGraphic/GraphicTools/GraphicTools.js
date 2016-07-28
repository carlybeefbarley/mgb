"use strict";
import _ from 'lodash';
import React from 'react';
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js';

export default class MapTools extends React.Component {

	render(){
		let config = {
      level: 2,
      buttons: [
        {
          name: "preview",
          label: "3D Preview",
          icon: "cube",
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
          name: "resetCamera",
          icon: "crosshairs",
          label: "Reset Camera",
          tooltip: "Set Zoom to 100% and move map to 0,0 coordinates",
          level: 5,
          shortcut: "Ctrl+Alt+R"
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
          name: "resetCamera",
          icon: "crosshairs",
          label: "Reset Camera",
          tooltip: "Set Zoom to 100% and move map to 0,0 coordinates",
          level: 5,
          shortcut: "Ctrl+Alt+R"
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
          name: "resetCamera",
          icon: "crosshairs",
          label: "Reset Camera",
          tooltip: "Set Zoom to 100% and move map to 0,0 coordinates",
          level: 5,
          shortcut: "Ctrl+Alt+R"
        },
      ]
    }
		
		return <Toolbar actions={this} config={config} className="map-tools" name="GraphicTools" />
	}

}