import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'semantic-ui-react'

import OutputError from './OutputError'
import OutputConsole from './OutputConsole'
import ChallengeInstructions from './ChallengeInstructions'
import CodeCredits from './CodeCredits'
import ChallengeCompleted from './ChallengeCompleted'
import ChallengeResults from './ChallengeResults'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { getFriendlyName, getNode } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo, utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'
import { learnSkill } from '/imports/schemas/skills'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'
import '../editcode.css'
import getCDNWorker from '/client/imports/helpers/CDNWorker'

const MAX_TIME_TO_RUN = 3 * 1000 // 3 seconds already seems very high amount of time

// This file is communicating with a test page hosted in an webWorker.
// The params related to it are in this structure for maintainability:
const _runFrameConfig = {
  srcUrl: '/codeTests.html', // In our git source, this is in app/public/
  style: { display: 'none', width: '10px', height: '10px' },
  eventName: 'message',
  codeTestsDataPrefix: 'codeTests',
}

const _openHelpChat = () => utilShowChatPanelChannel(window.location, 'G_MGBHELP_')

export default class CodeChallenges extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    skillPath: PropTypes.string,
    userSkills: PropTypes.object,
    codeMirror: PropTypes.object,
    active: PropTypes.bool,
    style: PropTypes.object,
    runChallengeDate: PropTypes.number,
    runCode: PropTypes.func,
  }

  constructor(props) {
    super(props)

    // this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      pendingLoadNextSkill: false, // True when next skill is loading.. better experience for slow networks
      results: [], // Array of results we get back from the worker that runs the tests
      testCount: 0, // how many times user run this test
      testsLoading: true, // by default true - waiting for initial message from web worker - loading state between post message to worker and receiving response
      latestTest: null, // indicates latest test date
      error: null, // get back from worker if it has some syntax error
      console: null, // get back from worker console.log messages
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
    this.initWorker()
  }

  componentWillUnmount() {
    this.worker.terminate()
    if (this.timeout) {
      window.clearTimeout(this.timeout)
      this.timeout = 0
    }
  }

  initWorker() {
    if (this.worker) this.worker.terminate()

    this.worker = getCDNWorker('/lib/workers/CodeChallenges.js')
    this.worker.onmessage = this.receiveMessage
  }
  receiveMessage = e => {
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = 0

    if (e.data.prefix && e.data.prefix === _runFrameConfig.codeTestsDataPrefix) {
      // ready simply tells that worker is ready to accept messages
      if (e.data.results !== 'ready') {
        this.setState({ results: e.data.results })
        this.setState({ error: e.data.error })
        this.setState({ console: e.data.console })
        this.setState({ testCount: this.state.testCount + 1 })
        this.setState({ latestTest: Date.now() })
        if (_.every(e.data.results, 'success')) {
          ga('send', 'pageview', this.props.skillPath)
          this.successPopup()
        }
        this.initWorker()
        // Gives TypeError because it gets the return value of runCode
        // and it needs a function in the arg...
        _.once(this.props.runCode())
      }
    }
    this.setState({ testsLoading: false })
  }

  scrollToTop = () => {
    let div = document.getElementById('tutorial-container')
    div.scrollTop = 0
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
    this.worker.postMessage(message)
    this.timeout = setTimeout(() => {
      this.worker.terminate()
      this.initWorker()

      this.receiveMessage({
        data: {
          prefix: _runFrameConfig.codeTestsDataPrefix,
          error: (
            <span>
              Test timed out! Please check your code! Or ask for a help on the {' '}
              <a
                onClick={_openHelpChat}
                style={{
                  cursor: 'pointer',
                  color: '#9edfff',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                }}
              >
                Help channel
              </a>!
            </span>
          ),
          results: [
            {
              success: false,
              message: 'Timed out',
            },
          ],
        },
      })
    }, MAX_TIME_TO_RUN)

    this.scrollToTop()
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
    let learnGroup

    if (_.startsWith(this.props.skillPath, 'code.js.intro')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.intro']), '$meta')
      learnGroup = 'intro'
    } else if (_.startsWith(this.props.skillPath, 'code.js.phaser')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.phaser']), '$meta')
      learnGroup = 'phaser'
    } else if (_.startsWith(this.props.skillPath, 'code.js.games')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.games']), '$meta')
      learnGroup = 'games'
    } else if (_.startsWith(this.props.skillPath, 'code.js.advanced')) {
      skillsArr = _.without(_.keys(SkillNodes.$meta.map['code.js.advanced']), '$meta')
      learnGroup = 'advanced'
    }

    const idx = skillsArr.indexOf(this.skillName)
    if (idx < skillsArr.length - 1) {
      const nextSkillName = skillsArr[idx + 1]
      this.setState({ pendingLoadNextSkill: true })
      // TODO - pass in area!
      const newSkillPath = `code.js.${learnGroup}.${nextSkillName}`
      const newSkillNode = getNode(newSkillPath).$meta
      StartJsGamesRoute(learnGroup, nextSkillName, this.props.currUser, false, newSkillNode)
    } else {
      utilPushTo(null, '/learn/code')
    }
  }

  navigateToSkillsList = () => {
    let skillPathArr = _.split(this.props.skillPath, '.')
    skillPathArr.pop()
    const returnToSkillsUrl = '/learn/code/' + skillPathArr.pop()

    utilPushTo(null, returnToSkillsUrl)
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
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            padding: '1em 1em 0 1em',
            backgroundColor: 'white',
            zIndex: 10,
          }}
        >
          <Button
            compact
            basic={showAllTestsCompletedMessage}
            size="mini"
            color="green"
            onClick={this.runTests}
            icon="play"
            content="Run tests"
            loading={this.state.testsLoading}
          />
          <Button
            compact
            basic
            size="mini"
            color="green"
            onClick={this.resetCode}
            icon="refresh"
            content="Reset code"
          />
          <Button
            compact
            basic
            size="mini"
            color="green"
            onClick={_openHelpChat}
            icon="help"
            data-position="bottom right"
            data-tooltip="Ask for help"
          />
          <Button
            compact
            basic
            size="mini"
            color="green"
            onClick={this.navigateToSkillsList}
            icon="up arrow"
            data-position="bottom right"
            data-tooltip="Go up to Challenges list"
          />
        </div>
        <div style={{ marginTop: '1.5em', padding: '1em' }}>
          <OutputError error={this.state.error} />

          {/*
          // Does not work with user added console logs
          // Use MGB's console instead
          <OutputConsole console={this.state.console} />
          */}

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
        </div>
      </div>
    )
  }
}
