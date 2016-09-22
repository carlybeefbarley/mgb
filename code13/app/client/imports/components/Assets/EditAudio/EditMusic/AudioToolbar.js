import _ from 'lodash'
import React from 'react'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'

export default class AudioToolbar extends React.Component {

  constructor (props){
    super(props)
  }

  addChannel(){
    this.props.addChannel()
  }

  togglePlay(){
    this.props.togglePlayMusic()
  }

  stopAudio(){
    this.props.stopMusic()
  }

  zoomIn(){
    this.props.zoom(true)
  }

  zoomOut(){
    this.props.zoom(false)
  }

  drag () {
    this.props.selectableButtons("isDrag")
  }

  select () {
    this.props.selectableButtons("isSelecting")
  }

  eraseSelected () {
    this.props.eraseSelected()
  }

  cutSelected () {
    this.props.cutSelected()
  }

  copySelected () {
    this.props.copySelected()
  }

  pasteSelected () {
    this.props.selectableButtons("isPaste")
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
          label: this.props.isPlaying ? "Pause" : "Play",
          icon:  this.props.isPlaying ? "pause" : "play",
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
          level: 3,
        },
        {
          name: 'zoomOut',
          label: 'Zoom Out',
          icon:  'zoom out',
          tooltip: 'Zoom Out',
          level: 3,
        },
        {
          name: 'separator'
        },
        {
          name: 'drag',
          label: 'Drag',
          icon:  'hand paper',
          tooltip: 'Drag sample',
          level: 5,
          active: this.props.isDrag,
        },
        {
          name: 'select',
          label: 'Select',
          icon:  'crosshairs',
          tooltip: 'Select',
          level: 5,
          active: this.props.isSelecting,
        },
        {
          name: 'eraseSelected',
          label: 'Erase',
          icon:  'eraser',
          tooltip: 'Erase selected area',
          level: 5,
          disabled: !this.props.selectData,
        },
        {
          name: 'cutSelected',
          label: 'Cut',
          icon:  'cut',
          tooltip: 'Cut selected area',
          level: 5,
          disabled: !this.props.selectData,
        },
        {
          name: 'copySelected',
          label: 'Copy',
          icon:  'copy',
          tooltip: 'Copy selected area',
          level: 5,
          disabled: !this.props.selectData,
        },
        {
          name: 'pasteSelected',
          label: 'Paste',
          icon:  'paste',
          tooltip: 'Paste audio sample',
          level: 5,
          disabled: !this.props.pasteData,
          active: this.props.isPaste,
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