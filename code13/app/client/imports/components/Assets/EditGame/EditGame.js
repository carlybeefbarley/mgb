import React, { PropTypes } from 'react'
import BaseForm from '/client/imports/components/Controls/BaseForm.js'
import { Button, Checkbox, Form, Input, Message, Radio, Select, TextArea } from 'semantic-ui-react'


const gameTypes = {
  'ActorMap Game (no code)': 'actorMapGame',
  'Code-Based Game': "codeGame"
}

class EditGameForm extends BaseForm {
  get data() {
    return this.props.asset.content2 || { gameType: 'codeGame', startCode: '', startActorMap: ''}
  }

  render() {
    return (
      <div className="ui form">
        {this.dropArea("Cover Graphic", "coverGraphic", "graphic", null, asset => {
          if (asset && asset.thumbnail)
            this.props.handleSave(null, asset.thumbnail, "Updating thumbnail")
        })}
        { this.options("Game Type", 'gameType', gameTypes)}
        { this.data.gameType === 'codeGame' && this.dropArea("Starting Code", 'startCode', 'code' )}
        { this.data.gameType === 'actorMapGame' && this.dropArea("Starting ActorMap", 'startActorMap', 'actormap' )}

      </div>
    )
  }
}

export default class EditGame extends React.Component {

  handleSave(reason, thumbnail) {
    //console.log("Pretending... Saving....")
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  render() {
    return (
      <EditGameForm asset={this.props.asset} onchange={this.handleSave.bind(this)}/>
    )
  }
}

// Future ideas
        // <Segment className="ui padded segment">
        //   <Header as='h4' className="ui header">Screen Sizes</Header>
        //   <Checkbox label='Smartphone (portrait)' />
        //   <br />
        //   <Checkbox label='Smartphone (landscape)' />
        //   <br />
        //   <Checkbox label='Full screen laptop/tablet' />
        //   <br />
        // </Segment>

        // <Segment className="ui padded segment">
        //   <Header as='h4' className="ui header">Works on...</Header>
        //   <Checkbox label='Touch-only devices' />
        //   <br />
        //   <Checkbox label='Keyboard & Mouse devices' />
        //   <br />
        //   <Checkbox label='GamePad devices' />
        //   <br />
        //   <Checkbox label='Telepathic mind control' />
        // </Segment>

        // { false &&  // Future ideas
        // <Segment className="ui padded segment">
        //   <Header as='h4' className="ui header">Features</Header>
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
