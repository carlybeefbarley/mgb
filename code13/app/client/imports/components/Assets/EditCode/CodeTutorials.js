import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Modal, Icon, Message, Divider, Header } from 'semantic-ui-react'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { isPhaserTutorial, getFriendlyName } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo, utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import { learnSkill } from '/imports/schemas/skills'
import { logActivity } from '/imports/schemas/activity'
import { ChatSendMessageOnChannelName } from '/imports/schemas/chats'

import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'

import './editcode.css'

const _smallTopMarginSty = { style: { marginTop: '0.5em' } }
const _openHelpChat = () => utilShowChatPanelChannel(window.location, 'G_MGBHELP_')

export default class CodeTutorials extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    skillPath: PropTypes.string,
    userSkills: PropTypes.object,
    codeMirror: PropTypes.object,
    active: PropTypes.bool,
    quickSave: PropTypes.func,
    highlightLines: PropTypes.func,
    assetId: PropTypes.string,
    asset: PropTypes.object,
    style: PropTypes.object,
    isOwner: PropTypes.bool,
    runCode: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.isPhaserTutorial = isPhaserTutorial(props.skillPath)

    this.state = {
      step: 0, // curent step of tutorial
      isCompleted: false, // indicator if current tutorial is completed and we need to show modal
      isTaskSubmitted: false, // indicator if task is submitted and we need to show modal
      data: {}, // will get from CDN
    }

    const prefix = this.isPhaserTutorial ? 'phaser' : 'games'
    mgbAjax(`/api/asset/code/!vault/` + prefix + `.` + this.skillName, (err, listStr) => {
      if (err) console.log('error', err)
      else this.setState({ data: JSON.parse(listStr) })
    })
  }

  stepNext = () => {
    const step = this.state.step + 1
    if (step < this.state.data.steps.length) {
      this.setState({ step })
      this.resetCode(step)
    } else this.successPopup()
    ga('send', 'pageview', this.props.skillPath)
  }

  stepBack = () => {
    if (this.state.step > 0) {
      const step = this.state.step - 1
      this.setState({ step })
      this.resetCode(step)
    }
  }

  submitTask = () => {
    const { currUser, assetId, skillPath } = this.props
    const url = `❮${currUser.username}:${assetId}❯`
    ChatSendMessageOnChannelName(
      'G_MGBHELP_',
      'Please check my Phaser task ' + url + ` for '${getFriendlyName(skillPath)}'`,
    )
    _openHelpChat()
    this.setState({ isTaskSubmitted: true })
    logActivity('task.askReview', 'Request for task review', null, this.props.asset)
    ga('send', 'pageview', this.props.skillPath)
  }

  resetCode = step => {
    step = _.isInteger(step) ? step : this.state.step
    const currStep = this.state.data.steps[step]
    const code = currStep.code
    this.props.codeMirror.setValue(code)
    this.props.quickSave()
    if (currStep.highlight) {
      currStep.highlight.map(highlight => {
        this.props.highlightLines(highlight.from, highlight.to)
      })
    }
  }

  handleRunCode = () => {
    this.props.runCode()
  }

  successPopup = () => {
    learnSkill(this.props.skillPath)
    this.setState({ isCompleted: true })
  }

  navigateToSkillsList = () => {
    const returnToSkillsUrl = this.isPhaserTutorial ? '/learn/code/phaser' : '/learn/code/games'
    utilPushTo(null, returnToSkillsUrl)
  }

  nextTutorial = () => {
    // We expect SkillNodes for this scenario to contain the following:
    //  $meta.tests
    //  $meta.code
    //  $meta.description
    let skillsArr = []
    let learnGroup

    if (_.startsWith(this.props.skillPath, 'code.js.phaser')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.phaser']), '$meta')
      learnGroup = 'phaser'
    }

    if (_.startsWith(this.props.skillPath, 'code.js.games')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.games']), '$meta')
      learnGroup = 'games'
    }

    const idx = skillsArr.indexOf(this.skillName)
    if (idx < skillsArr.length - 1) {
      const nextSkillName = skillsArr[idx + 1]
      StartJsGamesRoute(learnGroup, nextSkillName, this.props.currUser)
    } else {
      utilPushTo(null, '/learn/code' + learnGroup)
    }
  }

  render() {
    const description = this.state.data.steps ? this.state.data.steps[this.state.step].text : ''
    const totalSteps = this.state.data.steps ? this.state.data.steps.length : 0
    const isLastStep = totalSteps > 0 && this.state.step == totalSteps - 1
    const { isCompleted, isTaskSubmitted } = this.state

    return (
      <div
        id="mgb-codeChallenges"
        className={'content ' + (this.props.active ? 'active' : '')}
        style={this.props.style}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            padding: '1em',
            backgroundColor: 'white',
            zIndex: 99,
          }}
        >
          <Button
            compact
            size="small"
            color="green"
            onClick={this.handleRunCode}
            icon="play"
            content="Run code"
          />
          {this.skillNode.$meta.isTask && (
            <Button
              compact
              size="small"
              color="green"
              disabled={!this.props.isOwner}
              onClick={this.submitTask}
              content="Submit task"
            />
          )}
          {!this.isPhaserTutorial && (
            <Button
              compact
              size="small"
              color="green"
              onClick={this.stepBack}
              icon="backward"
              content="Back"
              disabled={this.state.step === 0 || isCompleted}
            />
          )}
          {!this.skillNode.$meta.isTask && (
            <Button
              compact
              size="small"
              color={isLastStep ? 'blue' : 'green'}
              onClick={this.stepNext}
              icon={isLastStep ? 'check' : 'forward'}
              content={isLastStep ? 'Finish' : 'Next'}
              disabled={isCompleted}
            />
          )}
          <Button
            compact
            basic
            size="small"
            color="green"
            onClick={this.resetCode}
            icon="refresh"
            content="Reset code"
          />
          <Button
            compact
            basic
            size="small"
            color="green"
            onClick={_openHelpChat}
            icon="help"
            data-position="top right"
            data-tooltip="Ask for help"
          />
          <Button
            compact
            basic
            size="small"
            color="green"
            onClick={this.navigateToSkillsList}
            icon="up arrow"
            data-position="top right"
            data-tooltip="Go up to Tutorial list"
          />
        </div>
        <div style={{ marginTop: '2.5em', padding: '1em' }}>
          <Divider
            as={Header}
            color="grey"
            size="tiny"
            horizontal
            content={getFriendlyName(this.props.skillPath)}
          />

          {isCompleted && (
            <Message size="small" icon>
              <Icon color="green" name="check circle" />
              <Message.Content>
                <Message.Header>Completed...</Message.Header>
                <Button
                  positive
                  compact
                  size="small"
                  content="Next Tutorial"
                  icon="right arrow"
                  labelPosition="right"
                  {..._smallTopMarginSty}
                  onClick={this.nextTutorial}
                />
              </Message.Content>
            </Message>
          )}

          {totalSteps > 1 && (
            <div style={{ color: '#aaa' }}>
              <small>
                Step #{1 + this.state.step} of {totalSteps}
              </small>
            </div>
          )}

          <div style={{ marginTop: '0.5em' }} dangerouslySetInnerHTML={{ __html: description }} />

          {isTaskSubmitted && (
            <Modal closeOnDocumentClick closeOnRootNodeClick={false} defaultOpen>
              <Modal.Header>
                <Icon size="big" color="green" name="check circle" />
                Task submitted
              </Modal.Header>
              <Modal.Content>
                Your task has been submitted for review. One of the moderators will look at it soon.
              </Modal.Content>
              <Modal.Actions>
                <Button positive content="Tutorial List" onClick={this.navigateToSkillsList} />
              </Modal.Actions>
            </Modal>
          )}
        </div>
      </div>
    )
  }
}
