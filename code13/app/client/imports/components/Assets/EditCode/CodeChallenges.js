import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Message, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes, { getFriendlyName } from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo, utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import { learnSkill, hasSkill } from '/imports/schemas/skills'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'

import './editcode.css'

// We expect SkillNodes for this scenario to contain the following:
//  $meta.tests
//  $meta.code
//  $meta.description
const _jsBasicsSkillsRootPath = 'code.js.basics'
const _jsBasicsSkillsRootNode = SkillNodes.$meta.map[_jsBasicsSkillsRootPath]

const _smallTopMarginSty = { style: { marginTop: '0.5em' } }

// This file is communicating with a test page hosted in an iFrame.
// The params related to it are in this structure for maintainability:
const _runFrameConfig = {
  srcUrl: '/codeTests.html', // In our git source, this is in app/public/
  style: { display: 'none', width: '10px', height: '10px' },
  eventName: 'message',
  codeTestsDataPrefix: 'codeTests',
}

const _openHelpChat = () => utilShowChatPanelChannel(window.location, 'G_MGBHELP_')
const _openChallengeList = () => utilPushTo(window.location, '/learn/code/basics')

export default class CodeChallenges extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    skillPath: PropTypes.string,
    userSkills: PropTypes.object,
    codeMirror: PropTypes.object,
    active: PropTypes.bool,
    style: PropTypes.object,
  }

  constructor(props) {
    super(props)

    // this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      pendingLoadNextSkill: false, // True when next skill is loading.. better experience for slow networks
      results: [], // Array of results we get back from the iFrame that runs the tests
      testCount: 0, // how many times user run this test
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
  }

  successPopup() {
    // TODO show notification for user
    learnSkill(this.props.skillPath)
    this.setState({ showAllTestsCompletedMessage: true })
  }

  runTests = () => {
    if (
      !this.state.data.tests // data not yet loaded from CDN
    )
      return false
    // const head = this.skillNode.$meta.head
    // const tail = this.skillNode.$meta.tail
    const head = this.state.data.head || []
    const tail = this.state.data.tail || []
    const message = {
      code: this.props.codeMirror.getValue(),
      tests: this.state.data.tests,
      head: head.join('\n'),
      tail: tail.join('\n'),
    }
    this.iFrame.contentWindow.postMessage(message, '*')
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
    const skillsArr = _.without(_.keys(_jsBasicsSkillsRootNode), '$meta')
    const idx = skillsArr.indexOf(this.skillName)

    if (idx < skillsArr.length - 1) {
      const nextSkillName = skillsArr[idx + 1]
      this.setState({ pendingLoadNextSkill: true })
      StartJsGamesRoute('basics', nextSkillName, this.props.currUser)
    } else {
      // this.setState( { showAllTestsCompletedMessage: false } )  <-- Better not to - reduce the number of redraws as we change.. we are redirecting anyway
      // alert('Congratulations! You have finished the JavaScript basics challenges!')
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

        {this.state.error &&
          <Segment inverted color="red" size="mini" secondary>
            <Icon name="warning sign" />
            {this.state.error}
          </Segment>}

        {this.state.console &&
          <Divider as={Header} color="grey" size="tiny" horizontal content="Console output" />}

        {this.state.console &&
          <Segment inverted color="black" size="mini" secondary>
            {this.state.console}
          </Segment>}

        {this.state.results &&
          this.state.results.length > 0 &&
          <Divider as={Header} {..._smallTopMarginSty} color="grey" size="tiny" horizontal>
            <span>
              Test Results&ensp;
              {latestTestTimeStr &&
                <small style={{ color: '#bbb' }}>
                  @{latestTestTimeStr}
                </small>}
            </span>
          </Divider>}
        <List verticalAlign="middle">
          {this.state.results.map((result, i) =>
            <List.Item key={i} className="animated fadeIn">
              <List.Icon
                size="large"
                name={`circle ${result.success ? 'check' : 'minus'}`}
                color={result.success ? 'green' : 'red'}
              />
              <List.Content>
                <span dangerouslySetInnerHTML={{ __html: _.replace(result.message, /^message: /, '') }} />
              </List.Content>
            </List.Item>,
          )}
        </List>

        {showAllTestsCompletedMessage &&
          <Message size="small" icon style={{ paddingBottom: 0 }}>
            <Icon color="green" name="check circle" />
            <Message.Content>
              <Message.Header>Success</Message.Header>
              <Button
                positive
                compact
                size="small"
                content="Start next challenge"
                disabled={this.state.pendingLoadNextSkill}
                icon={
                  this.state.pendingLoadNextSkill ? { loading: true, name: 'circle notched' } : 'right arrow'
                }
                labelPosition="right"
                {..._smallTopMarginSty}
                onClick={this.nextChallenge}
              />
            </Message.Content>
          </Message>}

        {/*  Challenge Instructions Header  */}
        <Divider
          as={Header}
          {..._smallTopMarginSty}
          color="grey"
          size="tiny"
          horizontal
          content="Challenge Instructions"
        />

        {fullBannerText && <Header sub content={fullBannerText} {..._smallTopMarginSty} />}

        {description.map((text, i) =>
          <div key={i} {..._smallTopMarginSty} dangerouslySetInnerHTML={{ __html: text }} />,
        )}

        {instructions.length > 0 &&
          <Segment stacked color="green">
            <Header sub content="Challenge Goal" />
            {instructions.map((text, i) =>
              <div key={i} {..._smallTopMarginSty} dangerouslySetInnerHTML={{ __html: text }} />,
            )}
          </Segment>}

        <Popup
          trigger={
            <a
              href="https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md"
              target="_blank"
              style={{ color: '#bbb', float: 'right' }}
            >
              <small>(based on FreeCodeCamp.com content)</small>
            </a>
          }
          position="left center"
          inverted
          size="mini"
          content="This Code Challenge is based on FreeCodeCamp content. Click for details"
        />

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
