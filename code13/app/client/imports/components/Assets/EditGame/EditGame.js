import React, { PropTypes } from 'react'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { GameItem } from '/client/imports/components/Assets/GameAsset/GameItems'
import './editGame.css'

const gameTypes = {
  'ActorMap Game (no code)': 'actorGame',
  'Code-Based Game': 'codeGame'
}

class EditGameForm extends BaseForm {
  get data() {
    return this.props.asset.content2 || { gameType: 'codeGame', startCode: '', startActorMap: '', playCount: 0 }
  }

  render() {
    return (
      <div className='ui form'>
        {this.dropArea('Cover Graphic', 'coverGraphic', 'graphic', null, asset => {
          if (asset && asset.thumbnail)
            this.props.saveThumbnail(asset.thumbnail)
        })}
        { this.options('Game Type', 'gameType', gameTypes)}
        { this.data.gameType === 'codeGame' && this.dropArea('Starting Code', 'startCode', 'code' )}
        { this.data.gameType === 'actorGame' && this.dropArea('Starting ActorMap', 'startActorMap', 'actormap' )}
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

  handleSave(reason, thumbnail) {
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  render() {
    return (
      <div className='edit-game'>
        <div className='ui items'>
          <GameItem game={this.props.asset} />
        </div>
        <EditGameForm 
            asset={this.props.asset} 
            canEdit={this.props.canEdit}
            onchange={this.handleSave.bind(this)} 
            saveThumbnail={(d) => { this.props.handleContentChange(this.props.asset.content2, d, "Updating thumbnail") }} />
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

        // <Segment className='ui padded segment'>
        //   <Header as='h4' className='ui header'>Works on...</Header>
        //   <Checkbox label='Touch-only devices' />
        //   <br />
        //   <Checkbox label='Keyboard & Mouse devices' />
        //   <br />
        //   <Checkbox label='GamePad devices' />
        //   <br />
        //   <Checkbox label='Telepathic mind control' />
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
