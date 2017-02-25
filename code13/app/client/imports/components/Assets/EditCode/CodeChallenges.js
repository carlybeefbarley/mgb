import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List, Segment, Popup, Divider, Header } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'
import { StartCodeJsRoute } from '/client/imports/routes/Learn/LearnCodeJsRoute'

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
    codeMirror:  PropTypes.object,
    active:      PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.skillNode = SkillNodes.$meta.map[props.skillPath]
    this.skillName = _.last(_.split(props.skillPath, '.'))
    this.state = {
      results:                    [],       // Array of results we get back from the iFrame that runs the tests
      error:                      null,     // get back from iFrame if it has some syntax error
      showAllTestsCompletedModal: false     // true if we want to show the All Tests Completed Modal
    }
  }

  componentDidMount() {
    this.getReference()
    window.addEventListener(_runFrameConfig.eventName, this.receiveMessage, false)
    // for some reason tests (iframe, codeMirror) are not ready when component did mount //!!!
    setTimeout( () => this.runTests(), _hackDeferForFirstTestRunMs)   
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
    const message = {
      code:  this.props.codeMirror.getValue(),
      tests: this.skillNode.$meta.tests
    }
    this.iFrame.contentWindow.postMessage(message, "*")
  }

  resetCode = () => {
    const newCode = this.skillNode.$meta.code.join( '\n' )
    this.props.codeMirror.setValue(newCode)
  }

  nextChallenge = () => {
    const skillsArr = _.without(_.keys(_jsBasicsSkillsRootNode), '$meta')
    const idx = skillsArr.indexOf(this.skillName)

    if (idx < skillsArr.length-1) {
      const nextSkillName = skillsArr[idx+1]
      const code = _jsBasicsSkillsRootNode[nextSkillName].$meta.code.join( '\n' )
      this.setState( { showAllTestsCompletedModal: false } )
      StartCodeJsRoute(nextSkillName, code, this.props.currUser)
    } 
    else
    {
      this.setState( { showAllTestsCompletedModal: false } )
      alert('Congratulations! You have finished the JavaScript basics challenges!')
    }
  }

  render() {
    const description = this.skillNode.$meta.description
    const { showAllTestsCompletedModal } = this.state

    return (
      <div className={"content " +(this.props.active ? "active" : "")}>
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
          this.state.results && this.state.results.length > 0 && 
            <Divider as={Header} color='grey' size='small' horizontal content='Test Results'/>
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
                closeOnDocumentClick={false} 
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