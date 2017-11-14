import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'semantic-ui-react'

import OutputError from './OutputError'
import OutputConsole from './OutputConsole'
import ChallengeInstructions from './ChallengeInstructions'
import CodeCredits from './CodeCredits'
import ChallengeCompleted from './ChallengeCompleted'
import ChallengeResults from './ChallengeResults'

import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { getFriendlyName } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo, utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'
import { learnSkill } from '/imports/schemas/skills'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'

import '../editcode.css'

// This file is communicating with a test page hosted in an iFrame.
// The params related to it are in this structure for maintainability:
const _runFrameConfig = {
  srcUrl: '/codeTests.html', // In our git source, this is in app/public/
  style: { display: 'none', width: '10px', height: '10px' },
  eventName: 'message',
  codeTestsDataPrefix: 'codeTests',
}

const _openHelpChat = () => utilShowChatPanelChannel(window.location, 'G_MGBHELP_')
const _openChallengeList = () => utilPushTo(window.location, '/learn/code/intro')

export default class CodeChallenges extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    skillPath: PropTypes.string,
    userSkills: PropTypes.object,
    codeMirror: PropTypes.object,
    active: PropTypes.bool,
    style: PropTypes.object,
    runChallengeDate: PropTypes.number,
  }

  constructor(props) {
    super(props)

    // this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      pendingLoadNextSkill: false, // True when next skill is loading.. better experience for slow networks
      results: [], // Array of results we get back from the iFrame that runs the tests
      testCount: 0, // how many times user run this test
      testsLoading: false, // loading state between post message to iframe and receiving response
      latestTest: null, // indicates latest test date
      error: null, // get back from iFrame if it has some syntax error
      console: null, // get back from iFrame console.log messages
      showAllTestsCompletedMessage: false, // true if we want to show the All Tests Completed Modal
      data: {}, // get challenge data from CDN
    }

    mgbAjax(`/api/asset/code/!vault/challenges.` + this.skillName, (err, listStr) => {
      if (err) console.log('error', err)
      else this.setState({ data: JSON.parse(listStr) })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // parent component runs challenge Tests
    // when to run is indicated by Date.now() if they don't match then run tests
    if (this.props.runChallengeDate && prevProps.runChallengeDate !== this.props.runChallengeDate) {
      this.runTests()
    }
  }

  componentDidMount() {
    this.getReference()
    window.addEventListener(_runFrameConfig.eventName, this.receiveMessage, false)
    // don't run automatic tests if user already has this skill. Useful for cases when user just checks his previous code
    // if(!hasSkill(this.props.userSkills, this.props.skillPath){
    // // for some reason tests (iframe, codeMirror) are not ready when component did mount //!!!
    //   setTimeout( () => this.runTests(), _hackDeferForFirstTestRunMs)
    // }
  }

  componentWillUnmount() {
    window.removeEventListener(_runFrameConfig.eventName, this.receiveMessage, false)
  }

  getReference() {
    this.iFrame = ReactDOM.findDOMNode(this.refs.iFrameTests)
  }

  receiveMessage = e => {
    if (e.data.prefix && e.data.prefix == _runFrameConfig.codeTestsDataPrefix) {
      this.setState({ results: e.data.results })
      this.setState({ error: e.data.error })
      this.setState({ console: e.data.console })
      this.setState({ testCount: this.state.testCount + 1 })
      this.setState({ latestTest: Date.now() })
      if (_.every(e.data.results, 'success')) {
        ga('send', 'pageview', this.props.skillPath)
        this.successPopup()
      }
    }
    this.setState({ testsLoading: false })
  }

  successPopup() {
    // TODO show notification for user
    learnSkill(this.props.skillPath)
    this.setState({ showAllTestsCompletedMessage: true })
    refreshBadgeStatus()
  }

  runTests = () => {
    // tests executing at the moment. Disable to run it twice
    if (this.state.testsLoading) return false

    if (
      !this.state.data.tests // data not yet loaded from CDN
    )
      return false
    const head = this.state.data.head || []
    const tail = this.state.data.tail || []
    const message = {
      code: this.props.codeMirror.getValue(),
      tests: this.state.data.tests,
      head: head.join('\n'),
      tail: tail.join('\n'),
      importException: this.state.data.importException,
    }
    this.iFrame.contentWindow.postMessage(message, '*')
    this.setState({ testsLoading: true })
  }

  resetCode = () => {
    if (
      !this.state.data.code // data not yet loaded from CDN
    )
      return false
    const newCode = this.state.data.code.join('\n')
    this.props.codeMirror.setValue(newCode)
  }

  nextChallenge = () => {
    // We expect SkillNodes for this scenario to contain the following:
    //  $meta.tests
    //  $meta.code
    //  $meta.description
    let skillsArr = []
    let learnGroup = 'basics'

    if (_.startsWith(this.props.skillPath, 'code.js.intro')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.intro']), '$meta')
      learnGroup = 'intro'
    }

    if (_.startsWith(this.props.skillPath, 'code.js.advanced')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.advanced']), '$meta')
      learnGroup = 'advanced'
    }

    const idx = skillsArr.indexOf(this.skillName)
    if (idx < skillsArr.length - 1) {
      const nextSkillName = skillsArr[idx + 1]
      this.setState({ pendingLoadNextSkill: true })
      StartJsGamesRoute(learnGroup, nextSkillName, this.props.currUser)
    } else {
      utilPushTo(null, '/learn/code')
    }
  }

  formatTime = ms => {
    const date = new Date(ms)
    return (
      twoDecimals(date.getHours()) +
      ':' +
      twoDecimals(date.getMinutes()) +
      ':' +
      twoDecimals(date.getSeconds())
    )

    function twoDecimals(num) {
      num += ''
      if (num.length == 1) num = '0' + num
      return num
    }
  }

  render() {
    const description = _.clone(this.state.data.description) || []
    const instructions = []
    const { showAllTestsCompletedMessage } = this.state
    const latestTestTimeStr = this.state.latestTest ? this.formatTime(this.state.latestTest) : null

    const fullBannerText = this.props.skillPath ? getFriendlyName(this.props.skillPath) : null

    // take out instructions from description array. Instructions are after <hr> tag
    const hrIdx = description.indexOf('<hr>')
    if (hrIdx > 0) {
      for (let i = description.length - 1; i >= hrIdx; i--) instructions.unshift(description.pop())

      // remove <hr> element
      instructions.shift()
    }

    return (
      <div
        id="mgb-codeChallenges"
        className={'content ' + (this.props.active ? 'active' : '')}
        style={this.props.style}
      >
        <Button
          compact
          basic={showAllTestsCompletedMessage}
          size="small"
          color="green"
          onClick={this.runTests}
          icon="play"
          content="Run tests"
          loading={this.state.testsLoading}
        />
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
          onClick={_openChallengeList}
          icon="up arrow"
          data-position="top right"
          data-tooltip="Go up to Challenges list"
        />

        <OutputError error={this.state.error} />

        <OutputConsole console={this.state.console} />

        <ChallengeResults results={this.state.results} latestTestTimeStr={latestTestTimeStr} />

        <ChallengeCompleted
          show={showAllTestsCompletedMessage}
          loading={this.state.pendingLoadNextSkill}
          onStartNext={this.nextChallenge}
        />

        <ChallengeInstructions
          instructions={instructions}
          description={description}
          fullBannerText={fullBannerText}
        />

        <CodeCredits />

        <iframe
          style={_runFrameConfig.style}
          ref="iFrameTests"
          sandbox="allow-modals allow-same-origin allow-scripts allow-popups"
          src={makeCDNLink(_runFrameConfig.srcUrl)}
          frameBorder="0"
          id="mgbjr-EditCode-codeTests-iframe"
        />
      </div>
    )
  }
}
