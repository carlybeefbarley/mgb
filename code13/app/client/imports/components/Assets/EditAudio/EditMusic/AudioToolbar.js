import _ from 'lodash'
import React from 'react'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'

export default class AudioToolbar extends React.Component {

  constructor (props){
    super(props)

    this.state = {
      isPlaying: false,
      isLoop: true,
      isDrag: false,
      isSelecting: false,
      selectData: null,
      pasteData: null,
      isPaste: false,
    }
  }

  addChannel(){

  }

  togglePlay(){

  }

  stopAudio(){

  }

  zoomIn(){

  }

  zoomOut(){

  }

  drag () {

  }

  select () {

  }

  eraseSelected () {

  }

  cutSelected () {

  }

  copySelected () {

  }

  pasteSelected () {
    
  }

  render () {
    const config = {
      level: 3,
      buttons: [
        {
          name: 'addChannel',
          label: 'Add Channel',
          icon: 'add square',
          tooltip: 'Add new audio channel',
          level: 1,
        },
        {
          name: 'separator'
        },
        {
          name: 'togglePlay',
          label: this.state.isPlaying ? "Play" : "Pause",
          icon:  this.state.isPlaying ? "play" : "pause",
          tooltip: 'Play/pause',
          level: 1,
        },
        {
          name: 'stopAudio',
          label: 'Stop',
          icon:  'stop',
          tooltip: 'Stop',
          level: 1,
        },
        // loop component
        // duration component
        {
          name: 'separator'
        },
        {
          name: 'zoomIn',
          label: 'Zoom In',
          icon:  'zoom',
          tooltip: 'Zoom In',
          level: 1,
        },
        {
          name: 'zoomOut',
          label: 'Zoom Out',
          icon:  'zoom out',
          tooltip: 'Zoom Out',
          level: 1,
        },
        {
          name: 'separator'
        },
        {
          name: 'drag',
          label: 'Drag',
          icon:  'hand paper',
          tooltip: 'Drag sample',
          level: 1,
        },
        {
          name: 'select',
          label: 'Select',
          icon:  'crosshairs',
          tooltip: 'Select',
          level: 1,
        },
        {
          name: 'eraseSelected',
          label: 'Erase',
          icon:  'eraser',
          tooltip: 'Erase selected area',
          level: 1,
        },
        {
          name: 'cutSelected',
          label: 'Cut',
          icon:  'cut',
          tooltip: 'Cut selected area',
          level: 1,
        },
        {
          name: 'copySelected',
          label: 'Copy',
          icon:  'copy',
          tooltip: 'Copy selected area',
          level: 1,
        },
        {
          name: 'pasteSelected',
          label: 'Paste',
          icon:  'paste',
          tooltip: 'Paste audio sample',
          level: 1,
        },
      ]
    }

    return <Toolbar
      actions={this}
      config={config}
      className='map-tools'
      name='AudioTools' />
  }

}