import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill, hasSkill } from '/imports/schemas/skills'
import { StartJsGamesRoute } from '/client/imports/routes/Learn/LearnCodeRouteItem'

import './editcode.css'

// We expect SkillNodes for this scenario to contain the following:
//  $meta.tests
//  $meta.code
//  $meta.description
const _jsBasicsSkillsRootPath = 'code.js.basics'
const _jsBasicsSkillsRootNode = SkillNodes.$meta.map[_jsBasicsSkillsRootPath]

// This file is communicating with a test page hosted in an iFrame. 
// The params related to it are in this structure for maintainability:
const _runFrameConfig = {
  srcUrl:     '/codeTests.html',         // In our git source, this is in app/public/
  style:      { display: 'none', width: '10px', height: '10px' },
  eventName:  'message',
  codeTestsDataPrefix: 'codeTests'
}

const _hackDeferForFirstTestRunMs = 200
const _openHelpChat = () => 
  utilPushTo(window.location, window.location.pathname, {'_fp':'chat.G_MGBHELP_'})

export default class CodeChallenges extends React.Component {

  static propTypes = {
    currUser:    PropTypes.object,
    skillPath:   PropTypes.string,
    userSkills:  PropTypes.object,
    codeMirror:  PropTypes.object,
    active:      PropTypes.bool
  }

  constructor(props) {
    super(props)

    // this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      results:                    [],       // Array of results we get back from the iFrame that runs the tests
      testCount:                  0,        // how many times user run this test
      latestTest:                 null,     // indicates latest test date
      error:                      null,     // get back from iFrame if it has some syntax error
      console:                    null,     // get back from iFrame console.log messages 
      showAllTestsCompletedModal: false,    // true if we want to show the All Tests Completed Modal
      data:                       {},       // get challenge data from CDN
    }

    mgbAjax(`/api/asset/code/!vault/challenges.`+this.skillName, (err, listStr) => {
      if (err)
        console.log('error', err)
      else 
        this.setState({ data: JSON.parse(listStr) })
    })
  }

  componentDidMount() {
    this.getReference()
    window.addEventListener(_runFrameConfig.eventName, this.receiveMessage, false)
    // don't run automatic tests if user already has this skill. Useful for cases when user just checks his previous code
    // if(!hasSkill(this.props.userSkills, this.props.skillPath + '.' + this.skillName)){
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
      this.setState({ testCount: this.state.testCount+1 })
      this.setState({ latestTest: Date.now() })
      if (_.every(e.data.results, 'success'))
        this.successPopup()
    }
  }

  successPopup() {
    // TODO show notification for user
    learnSkill( this.props.skillPath + '.' + this.skillName )
    this.setState( { showAllTestsCompletedModal: true } )
  }

  runTests = () => {
    if(!this.state.data.tests)      // data not yet loaded from CDN
      return false
    // const head = this.skillNode.$meta.head
    // const tail = this.skillNode.$meta.tail
    const head = this.state.data.head || []
    const tail = this.state.data.tail || []
    const message = {
      code:   this.props.codeMirror.getValue(),
      tests:  this.state.data.tests,
      head:   head.join( '\n' ),
      tail:   tail.join( '\n' )
    }
    this.iFrame.contentWindow.postMessage(message, "*")
  }

  resetCode = () => {
    if(!this.state.data.code)       // data not yet loaded from CDN
      return false
    const newCode = this.state.data.code.join( '\n' )
    this.props.codeMirror.setValue(newCode)
  }

  nextChallenge = () => {
    const skillsArr = _.without(_.keys(_jsBasicsSkillsRootNode), '$meta')
    const idx = skillsArr.indexOf(this.skillName)

    if (idx < skillsArr.length-1) {
      const nextSkillName = skillsArr[idx+1]
      this.setState( { showAllTestsCompletedModal: false } )
      StartJsGamesRoute('basics', nextSkillName, this.props.currUser)
    } 
    else
    {
      this.setState( { showAllTestsCompletedModal: false } )
      // alert('Congratulations! You have finished the JavaScript basics challenges!')
      utilPushTo( window.location, '/learn/code' )
    }
  }

  formatTime = (ms) => {
    const date = new Date(ms)
    return twoDecimals(date.getHours()) + ':' + twoDecimals(date.getMinutes()) + ':' + twoDecimals(date.getSeconds())

    function twoDecimals(num){
      num += ''
      if(num.length == 1) 
        num = '0'+num
      return num
    }
  }

  render() {
    // const description = this.skillNode.$meta.description
    const description = this.state.data.description || []
    const { showAllTestsCompletedModal } = this.state
    const testCountStr = this.state.testCount > 0 ? ' '+this.state.testCount : ''
    const latestTest = this.state.latestTest ? this.formatTime(this.state.latestTest) : ''

    return (
      <div id="codeChallenges" className={"content " +(this.props.active ? "active" : "")}>
        <Button size='small' color='green' onClick={this.runTests} icon='play' content='Run tests' />
        <Button size='small' color='green' onClick={this.resetCode} icon='refresh' content='Reset code' />
        <Button size='small' color='green' onClick={_openHelpChat} icon='help' content='Help' />

        { this.state.error &&
          <Segment inverted color='red' size='mini' secondary>
            <Icon name='warning sign' />
            {this.state.error}
          </Segment>
        }

        { 
          this.state.console &&
            <Divider as={Header} color='grey' size='small' horizontal content='Console output'/>
        }

        { 
          this.state.console &&
            <Segment inverted color='black' size='mini' secondary>
              {this.state.console}
            </Segment>
        }

        { 
          this.state.results && this.state.results.length > 0 && 
            <Divider 
              as={Header} 
              color='grey' 
              size='small' 
              horizontal content={'Test Results' + testCountStr}/>
        }
        <List verticalAlign='middle'>
        {
          this.state.results.map((result, i) => (
            <List.Item key={i}>
              <List.Icon 
                  size='large'
                  name={`circle ${result.success ? 'check' : 'minus'}`}
                  color={result.success ? 'green' : 'red'} />
              <List.Content>
                <span dangerouslySetInnerHTML={{ __html: _.replace(result.message, /^message: /, '')}} />
              </List.Content>
            </List.Item>
          ))
        }
        <List.Item><List.Content style={{textAlign:'right', fontSize: '11px', color:'#999'}}>{latestTest}</List.Content></List.Item>
        </List>

        <Divider as={Header} color='grey' size='small' horizontal content='Challenge Instructions'/>

        {
          description.map((text, i) => (
            <div key={i} style={{marginTop: '0.5em'}} dangerouslySetInnerHTML={{ __html: text}} />
          ))
        }

        <Divider />

        <Popup
          trigger={(
            <a
                href='https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md'
                target="_blank" 
                style={ { color: '#aaa', float: 'right' } } >
              <small>(FreeCodeCamp content)</small>
            </a>
          )}
          positioning='left center'
          inverted
          size='mini'
          content='This Code Challenge is based on FreeCodeCamp content. Click for details'/>

        <iframe
          style={_runFrameConfig.style}
          ref="iFrameTests"
          sandbox='allow-modals allow-same-origin allow-scripts allow-popups'
          src={makeCDNLink(_runFrameConfig.srcUrl)}
          frameBorder="0"
          id="mgbjr-EditCode-codeTests-iframe"
          >
        </iframe>

        { showAllTestsCompletedModal && (
            <Modal 
                closeOnDocumentClick={true} 
                closeOnRootNodeClick={false}
                defaultOpen >
              <Modal.Header>
                <Icon size='big' color='green' name='check circle' />
                Success
              </Modal.Header>
              <Modal.Content>
                You completed this Code Challenge
              </Modal.Content>
              <Modal.Actions>
                <Button 
                    positive
                    content='Next challenge'
                    onClick={this.nextChallenge} />
              </Modal.Actions>
            </Modal>
          )
        }
      </div>
    )
  }
}