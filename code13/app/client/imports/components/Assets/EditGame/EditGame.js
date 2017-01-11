import React, { PropTypes } from 'react'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { GameItem } from '/client/imports/components/Assets/GameAsset/GameItems'
import { Header, Divider, Message } from 'semantic-ui-react'

import './editGame.css'

const _gameTypes = {
  'ActorMap Game (no code)': 'actorGame',
  'Code-Based Game':         'codeGame'
}

const _isActorGame = assetMetadata => ( assetMetadata.gameType === 'actorGame' )
const _isCodeGame  = assetMetadata => ( assetMetadata.gameType === 'codeGame' )
const _hasGameType = assetMetadata => ( _isActorGame(assetMetadata) || _isCodeGame(assetMetadata) )

const _actorGameSupportedControls = { 
  supportsTouchControl:         false, 
  supportsMultiTouchControl:    false, 
  supportsKeyControl:           true, 
  supportsKeyPlusMouseControl:  true 
} 

const _defaultGameAssetMetadata = { 
  gameType:       'codeGame', 
  startCode:      '', 
  startActorMap:  '', 
  playCount:      0 
}


class EditGameForm extends BaseForm {

  get data() {
    return this.props.asset.metadata
  }

  render() {
    const isActorGame = _isActorGame(this.data)
    const isCodeGame  = _isCodeGame(this.data)
    const hasGameType = _hasGameType(this.data)
    const touchControlSupportedFieldOptions = { boolIsTF: true, disabled: isActorGame }

    return (
      <div className='ui form'>
        {this.dropArea('Cover Graphic', 'coverGraphic', 'graphic', null, asset => {
          if (asset && asset.thumbnail)
            this.props.saveThumbnail(asset.thumbnail)
        })}

        <Divider />

        { this.options('Game Type', 'gameType', _gameTypes)}

        { isCodeGame  && this.dropArea('Starting Code', 'startCode', 'code' )}
        { isActorGame && this.dropArea('Starting ActorMap', 'startActorMap', 'actormap' )}
        
        { hasGameType && 
          <div>
            <Divider />
            <Header as='h4' content='Supported control schemes' />
            { isActorGame && <Message compact info size='small' attached='bottom' content='ActorMap Games only support keyboard+mouse systems (currently)' /> }
            { this.bool('Single touch / mouse', 'supportsTouchControl',        touchControlSupportedFieldOptions ) }
            { this.bool('Multitouch',           'supportsMultiTouchControl',   touchControlSupportedFieldOptions ) }
            { this.bool('Keyboard/keypad',      'supportsKeyControl',          touchControlSupportedFieldOptions ) }
            { this.bool('Keyboard+mouse',       'supportsKeyPlusMouseControl', touchControlSupportedFieldOptions ) }
          </div>
        }

        <Divider />
        <Header as='h4' content='Statistics' />
        <div className='inline fields disabled'><label>Play Count</label>{this.data.playCount || 0}&emsp;&emsp;<small>(You cannot edit Play Counts)</small></div>

      </div>
    )
  }
}

export default class EditGame extends React.Component {

  static propTypes = {
    asset:                PropTypes.object,
    canEdit:              PropTypes.bool.isRequired,
    currUser:             PropTypes.object,
    handleContentChange:  PropTypes.func,
    editDeniedReminder:   PropTypes.func,
    activitySnapshots:    PropTypes.array               // can be null whilst loading
  }

  handleSave(reason) {
    if (_isActorGame(this.props.asset.metadata))
      this.props.asset.metadata = Object.assign( this.props.asset.metadata, _actorGameSupportedControls )
    this.props.handleMetadataChange(this.props.asset.metadata)
  }

  render() {
    const { asset, canEdit, handleContentChange } = this.props
    if (!asset) 
      return null

    if (!asset.metadata)
      asset.metadata = _defaultGameAssetMetadata

    return (
      <div className='edit-game'>
        <div className='ui items'>
          <GameItem game={asset} />
        </div>
        <EditGameForm 
            asset={asset} 
            canEdit={canEdit}
            onChange={this.handleSave.bind(this)}
            saveThumbnail={(d) => { handleContentChange(null, d, "Updating thumbnail") }} />
      </div>
    )
  }
}

// Future ideas
  // <Segment className='ui padded segment'>
  //   <Header as='h4' className='ui header'>Screen Sizes</Header>
  //   <Checkbox label='Smartphone (portrait)' />
  //   <br />
  //   <Checkbox label='Smartphone (landscape)' />
  //   <br />
  //   <Checkbox label='Full screen laptop/tablet' />
  //   <br />
  // </Segment>

  // { false &&  // Future ideas
  // <Segment className='ui padded segment'>
  //   <Header as='h4' className='ui header'>Features</Header>
  //   <Checkbox label='Lobbies' />
  //   <br />
  //   <Checkbox label='Save Game state in cloud' />
  //   <br />
  //   <Checkbox label='Highscores' />
  //   <br />
  //   <Checkbox label='Achievements' />
  //   <br />
  //   <Checkbox label='Realtime MultiPlayer' />
  //   <br />
  //   <Checkbox label='Turn-based MultiPlayer' />
  //   <br />
  // </Segment>
