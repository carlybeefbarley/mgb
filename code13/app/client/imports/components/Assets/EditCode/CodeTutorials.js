import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { isPhaserTutorial } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'

import { ChatSendMessageOnChannelName } from '/imports/schemas/chats'

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
    quickSave:   PropTypes.func,
    highlightLines: PropTypes.func,
    assetId:     PropTypes.string
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.isPhaserTutorial = isPhaserTutorial(props.skillPath)

    this.state = {
      step: 0,                  // curent step of tutorial
      isCompleted: false,       // indicator if current tutorial is completed and we need to show modal
      isTaskSubmitted: false,   // indicator if task is submitted and we need to show modal
      data: {}                  // will get from CDN
    }

    const prefix = this.isPhaserTutorial ? 'phaser' : 'games'
    mgbAjax(`/api/asset/code/!vault/`+prefix+`.`+this.skillName, (err, listStr) => {
      if (err)
        console.log('error', err)
      else 
        this.setState({ data: JSON.parse(listStr) })
    })
  }

  componentDidMount () {
    const tutorialUrl = makeCDNLink(window.location.origin + this.skillNode.$meta.link) 
  }

  stepNext = () => {
    const step = this.state.step + 1
    if (step < this.state.data.steps.length) {
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

  submitTask = () => {
    const url = `❮!vault:${this.props.assetId}❯`
    ChatSendMessageOnChannelName('G_MGBHELP_', 'Check my Phaser task ' + url)
    utilPushTo(window.location, window.location.pathname, {'_fp':'chat.G_MGBHELP_'})
    this.setState({ isTaskSubmitted: true })
  }

  resetCode = (step) => {
    step = _.isInteger(step) ? step : this.state.step
    const currStep = this.state.data.steps[step]
    const code = currStep.code
    this.props.codeMirror.setValue(code)
    this.props.quickSave()
    if(currStep.highlight){
      currStep.highlight.map((highlight) => {
        this.props.highlightLines(highlight.from, highlight.to)
      })
    }
  }

  successPopup = () => {
    learnSkill( this.props.skillPath + '.' + this.skillName )
    this.setState({ isCompleted: true })
  }

  render () {
    const description = this.state.data.steps ? this.state.data.steps[this.state.step].text : ''
    const { isCompleted, isTaskSubmitted } = this.state
    const returnToSkillsUrl = this.isPhaserTutorial ? '/learn/code/phaser' : '/learn/code/games'

    return (
      <div id="codeChallenges" className={"content " +(this.props.active ? "active" : "")}>
        {
          this.skillNode.$meta.isTask &&
          <Button size='small' color='green' onClick={this.submitTask} content='Submit task' />
        }
        {
          !this.isPhaserTutorial &&
          <Button size='small' color='green' onClick={this.stepBack} icon='backward' content='Back' disabled={this.state.step === 0} />
        }
        {
          !this.skillNode.$meta.isTask &&
          <Button size='small' color='green' onClick={this.stepNext} icon='forward' content='Next' />
        }
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
                    onClick={ () => { utilPushTo( window.location, returnToSkillsUrl ) }} />
              </Modal.Actions>
            </Modal>
          )
        }

        { isTaskSubmitted && (
            <Modal 
                closeOnDocumentClick={true} 
                closeOnRootNodeClick={false}
                defaultOpen >
              <Modal.Header>
                <Icon size='big' color='green' name='check circle' />
                Task submitted
              </Modal.Header>
              <Modal.Content>
                You have submitted task for review
              </Modal.Content>
              <Modal.Actions>
                <Button 
                    positive
                    content='Tutorial List'
                    onClick={ () => { utilPushTo( window.location, returnToSkillsUrl ) }} />
              </Modal.Actions>
            </Modal>
          )
        }

      </div>
    )
  }

}