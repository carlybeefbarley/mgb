import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Modal, Icon, List } from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'
import { StartCodeJsRoute } from '/client/imports/routes/Learn/LearnCodeJsRoute'

import './editcode.css'

export default class CodeChallenges extends React.Component {

  static propTypes = {
    currUser:    PropTypes.object,
    skillPath:   PropTypes.string,
    codeMirror:  PropTypes.object,
    active:      PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.skillNode = this.getSkillNode(props.skillPath)
    const skillArr = props.skillPath.split('.')
    this.skillName = skillArr[skillArr.length-1]
    this.state = {
      results:                    [],       // Array of results we get back from the iFrame that runs the tests
      showAllTestsCompletedModal: false     // true if we want to show the All Tests Completed Modal
    }
  }

  componentDidMount() {
    this.getReference()
    window.addEventListener("message", this.receiveMessage.bind(this), false)
    setTimeout( () => this.runTests(), 200)   // for some reason tests (iframe, codeMirror) are not ready when component did mount
  }

  getReference() {
    this.iFrame = ReactDOM.findDOMNode(this.refs.iFrameTests)
  }

  getSkillNode() {
    let skillNodes = _.cloneDeep(SkillNodes)
    const path = this.props.skillPath.split('.')
    while (path.length > 0)
      skillNodes = skillNodes[path.shift()]
    return skillNodes
  }

  receiveMessage(e) {
    if (e.data.prefix && e.data.prefix == 'codeTests') {
      this.setState({ results: e.data.results })
      
      let totalSuccess = true
      e.data.results.map((result) => {
        if (!result.success)
          totalSuccess = false
      })
      if (totalSuccess)
        this.successPopup()
    }
  }

  successPopup() {
    const skillPath = this.props.skillPath + '.' + this.skillName
    // console.log('skill learned', skillPath)
    // TODO show notification for user
    learnSkill( skillPath )

    this.setState( { showAllTestsCompletedModal: true } )
  }

  runTests() {
    const tests = this.skillNode.$meta.tests
    const message = {
      code: this.props.codeMirror.getValue(),
      tests: tests
    }

    this.iFrame.contentWindow.postMessage(message, "*")
  }

  resetCode() {
    const newCode = this.skillNode.$meta.code.join( '\n' )
    this.props.codeMirror.setValue(newCode)
  }

  onpenHelpChat(){
    utilPushTo(window.location, window.location.pathname, {'_fp':'chat.G_MGBHELP_'})
  }

  nextChallenge(){
    const jsSkills = SkillNodes.code.js.basics
    const skillsArr = []
    for (let key in jsSkills) {
      if (jsSkills.hasOwnProperty( key ) && key != '$meta')
        skillsArr.push(key)
    }

    const idx = skillsArr.indexOf(this.skillName)

    if (idx < skillsArr.length-1) {
      const nextSkillName = skillsArr[idx+1]
      const code = SkillNodes.code.js.basics[nextSkillName].$meta.code.join( '\n' )
      // console.log(nextSkillName, code)

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
        <Button size='small' color='green' onClick={this.runTests.bind(this)}>
          <Icon name='play' /> Run tests
        </Button>
        <Button size='small' color='green' onClick={this.resetCode.bind(this)}>
          <Icon name='refresh' /> Reset code
        </Button>
        <Button size='small' color='green' onClick={this.onpenHelpChat.bind(this)}>
          <Icon name='help' /> Help
        </Button>

        <List relaxed>
        {
          this.state.results.map((result, i) => (
            <List.Item key={i}>
              <List.Icon 
                  size='big'
                  name={`circle ${result.success ? 'check' : 'minus'}`}
                  color={result.success ? 'green' : 'red'} />
              <List.Content>
                <span dangerouslySetInnerHTML={{ __html: result.message}} />
              </List.Content>
            </List.Item>
          ))
        }
        </List>

        {
          description.map((text, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: text}} />
          ))
        }

        <iframe
          style={{ display: "none", width: "10px", height: "10px" }}
          ref="iFrameTests"
          sandbox='allow-modals allow-same-origin allow-scripts allow-popups'
          src={makeCDNLink('/codeTests.html')}
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
                    onClick={this.nextChallenge.bind(this)} />
              </Modal.Actions>
            </Modal>
          )
        }
      </div>
    )
  }
}