import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Button, Icon } from 'semantic-ui-react'

import ImportSound from './ImportSound.js'
import SoundStock from './SoundStock.js'
import CreateSound from './CreateSound.js'
import WaveSurfer from '../lib/WaveSurfer.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

export default class EditSound extends React.Component {
  constructor(props) {
    super(props)

    // console.log(props)

    this.state = {
      playerStatus: 'pause',
      isImportModal: false,
      isCreateModal: false,
    }
  }

  componentDidMount() {
    this.wavesurfer = WaveSurfer.create({
      container: '#soundPlayer',
      waveColor: 'violet',
      progressColor: 'purple',
    })

    this.previewPlayer = WaveSurfer.create({
      container: '#previewDiv',
      waveColor: 'violet',
      progressColor: 'purple',
    })

    this.soundCanvas = $('#soundPlayer canvas')[0]
    this.soundCtx = this.soundCanvas.getContext('2d')

    let c2 = this.props.asset.content2
    if (c2.dataUri) {
      this.wavesurfer.load(c2.dataUri)
      this.previewPlayer.load(c2.dataUri)
    }

    let self = this
    this.wavesurfer.on('finish', function() {
      self.wavesurfer.stop()
      self.setState({ playerStatus: 'pause' })
    })
    this.wavesurfer.on('ready', function() {
      // self.handleSave()
    })
    this.previewPlayer.on('ready', function() {
      self.handleSave()
    })
  }

  importSound(soundObject, saveText) {
    if (!this.hasPermission) return

    if (soundObject) {
      this.wavesurfer.load(soundObject.src)
      this.previewPlayer.load(soundObject.src)
      let c2 = this.props.asset.content2
      c2.dataUri = soundObject.src
      c2.duration = soundObject.duration
      this.saveText = saveText
    }
    this.setState({ isCreateModal: false })
    this.setState({ isImportModal: false })
    joyrideCompleteTag('mgbjr-CT-editSound-sound-imported')
  }

  togglePlaySound() {
    if (this.state.playerStatus === 'play') {
      this.wavesurfer.pause()
      this.setState({ playerStatus: 'pause' })
    } else {
      this.wavesurfer.play()
      this.setState({ playerStatus: 'play' })
    }
  }

  stopSound() {
    this.wavesurfer.stop()
    this.setState({ playerStatus: 'pause' })
  }

  hasPermission() {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return false
    } else {
      return true
    }
  }

  handleSave() {
    if (!this.hasPermission) return
    if (!this.saveText) return // don't save at start when sound is loaded

    let asset = this.props.asset
    let c2 = asset.content2

    const previewCanvas = $('#previewDiv')
      .children()
      .first()
      .children()
      .first()[0]
    this.props.handleContentChange(c2, previewCanvas.toDataURL('image/png'), this.saveText)
  }

  openCreateModal = () => {
    this.setState({ isCreateModal: true })
    joyrideCompleteTag('mgbjr-CT-editSound-createSound-invoke')
  }

  render() {
    return (
      <div className="ui grid">
        <div className="ui sixteen wide column">
          <div>
            {/*** button row ***/}
            <Modal
              open={this.state.isImportModal}
              closeOnDimmerClick
              onClose={() => this.setState({ isImportModal: false })}
              trigger={
                <Button
                  onClick={() => this.setState({ isImportModal: true })}
                  size="small"
                  id="mgbjr-EditSound-importSound"
                >
                  <Icon name="add square" />
                  Import
                </Button>
              }
            >
              <ImportSound importSound={this.importSound.bind(this)} />
            </Modal>

            <Modal
              open={this.state.isCreateModal}
              closeOnDimmerClick
              onClose={() => this.setState({ isCreateModal: false })}
              trigger={
                <Button onClick={this.openCreateModal} size="small" id="mgbjr-EditSound-createSound">
                  <Icon name="options" />
                  Create
                </Button>
              }
            >
              <CreateSound importSound={this.importSound.bind(this)} />
            </Modal>
          </div>

          <div className="content">
            <div id="soundPlayer" />
            <div className="row">
              <button
                id="mgbjr-EditSound-playSound"
                className="ui icon button small"
                onClick={this.togglePlaySound.bind(this)}
              >
                <i className={'icon ' + (this.state.playerStatus === 'play' ? 'pause' : 'play')} />
              </button>
              <button className="ui icon button small" onClick={this.stopSound.bind(this)}>
                <i className={'icon stop'} />
              </button>
            </div>
          </div>
          <div id="previewDiv" style={{ width: '280px', height: '128px', visibility: 'hidden' }} />
        </div>
      </div>
    )
  }
}
