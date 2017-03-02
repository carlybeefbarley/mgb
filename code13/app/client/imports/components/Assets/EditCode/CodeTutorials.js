import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'

// TODO make this dynamic
import tutorialObject from '/public/codeTutorials.json'


import './editcode.css'


const _jsGamesSkillsPath = 'code.js.games'
const _jsGamesSkillsNode = SkillNodes.$meta.map[_jsGamesSkillsPath]


export default class CodeTutorials extends React.Component {

  static propTypes = {
    currUser:    PropTypes.object,
    skillPath:   PropTypes.string,
    userSkills:  PropTypes.object,
    codeMirror:  PropTypes.object,
    active:      PropTypes.bool,
    quickSave:   PropTypes.func
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.tutorialData = tutorialObject[this.skillName]
    this.state = {
      step: 0,            // curent step of tutorial
      isCompleted: false  // indicator if current tutorial is completed and we need to show modal
    }
  }

  componentDidMount () {
    const tutorialUrl = makeCDNLink(window.location.origin + this.skillNode.$meta.link) 
  }

  stepNext = () => {
    const step = this.state.step + 1
    if (step < this.tutorialData.steps.length) {
      this.setState({ step: step }) 
      this.resetCode(step)
    }
    else
      this.successPopup()
  }

  stepBack = () => {
    if (this.state.step > 0) {
      const step = this.state.step - 1
      this.setState({ step: step }) 
      this.resetCode(step)
    }
  }

  resetCode = (step) => {
    step = typeof step != 'undefined' ? step : this.state.step
    const code = this.tutorialData.steps[step].code
    this.props.codeMirror.setValue(code)
    this.props.quickSave()
  }

  successPopup = () => {
    learnSkill( this.props.skillPath + '.' + this.skillName )
    this.setState({ isCompleted: true })
  }

  render () {
    const description = this.tutorialData.steps[this.state.step].text
    const { isCompleted } = this.state

    return (
      <div id="codeChallenges" className={"content " +(this.props.active ? "active" : "")}>
        <Button size='small' color='green' onClick={this.stepBack} icon='backward' content='Back' disabled={this.state.step === 0} />
        <Button size='small' color='green' onClick={this.stepNext} icon='forward' content='Next' />
        <Button size='small' color='green' onClick={this.resetCode} icon='refresh' content='Reset code' />

        <Divider as={Header} color='grey' size='small' horizontal content='Description'/>
        <div style={{marginTop: '0.5em'}} dangerouslySetInnerHTML={{ __html: description}} />

        { isCompleted && (
            <Modal 
                closeOnDocumentClick={true} 
                closeOnRootNodeClick={false}
                defaultOpen >
              <Modal.Header>
                <Icon size='big' color='green' name='check circle' />
                Success
              </Modal.Header>
              <Modal.Content>
                You completed this Code Tutorial
              </Modal.Content>
              <Modal.Actions>
                <Button 
                    positive
                    content='Tutorial List'
                    onClick={ () => { utilPushTo( window.location, '/learn/code/jsGames' ) }} />
              </Modal.Actions>
            </Modal>
          )
        }

      </div>
    )
  }

}