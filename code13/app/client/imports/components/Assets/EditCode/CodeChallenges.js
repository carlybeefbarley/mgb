import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import {
  Button,
  Divider,
  Header,
  Icon,
  Image,
  Label,
} from 'semantic-ui-react'

import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
import SkillNodes from '/imports/Skills/SkillNodes/SkillNodes'
import { utilPushTo } from "/client/imports/routes/QLink"
import { learnSkill } from '/imports/schemas/skills'
import { StartCodeJsRoute } from '/client/imports/routes/Learn/LearnCodeJsRoute'

import './editcode.css'

export default class CodeChallenges extends React.Component {

  constructor(props) {
    super(props)

    // console.log(this.props.skillPath)
    
    this.skillNode = this.getSkillNode(props.skillPath)
    const skillArr = props.skillPath.split('.')
    this.skillName = skillArr[skillArr.length-1]

    this.state = {
      results: []
    }

  }

  componentDidMount() {
    // console.log('component did mount')
    this.getReference()

    window.addEventListener("message", this.receiveMessage.bind(this), false)

  }

  getReference() {
    this.iFrame = ReactDOM.findDOMNode(this.refs.iFrameTests)
    this.testsSuccessModal = ReactDOM.findDOMNode(this.refs.testsSuccessModal)
  }

  getSkillNode(){
    let skillNodes = _.cloneDeep(SkillNodes)
    const path = this.props.skillPath.split('.')
    while(path.length > 0){
      skillNodes = skillNodes[path.shift()]
    }
    return skillNodes
  }

  receiveMessage(e){
    if(e.data.prefix && e.data.prefix == 'codeTests'){
      // console.log(e.data.results)
      this.setState({ results: e.data.results })
      
      let totalSuccess = true
      e.data.results.map((result) => {
        if(!result.success){
          totalSuccess = false
        }
      })
      if(totalSuccess)
        this.successPopup()
    }
  }

  successPopup(){
    const skillPath = this.props.skillPath + '.' + this.skillName
    // console.log('skill learned', skillPath)

    // TODO show notification for user
    learnSkill( skillPath )

    $(this.testsSuccessModal).modal('show')
  }

  runTests(){
    const tests = this.skillNode.$meta.tests

    const message = {
      code: this.props.codeMirror.getValue(),
      tests: tests
    }

    this.iFrame.contentWindow.postMessage(message, "*")
  }

  resetCode(){
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
      if (jsSkills.hasOwnProperty( key ) && key != '$meta') {
        skillsArr.push(key)
      }
    }

    const idx = skillsArr.indexOf(this.skillName)

    if(idx < skillsArr.length-1){
      const nextSkillName = skillsArr[idx+1]
      const code = SkillNodes.code.js.basics[nextSkillName].$meta.code.join( '\n' )
      // console.log(nextSkillName, code)

      $(this.testsSuccessModal).modal('hide')
      StartCodeJsRoute(nextSkillName, code, this.props.currUser)
    } else {
      // TODO replace with proper modal
      alert('Congratulations! You have finished JavaScript basics challenges.')
    }


    
  }

  render() {
    const description = this.skillNode.$meta.description

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

        {
          this.state.results.map((result, idx) => (
            <div key={idx}>
              <i className={"icon circle " + (result.success ? "check big green" : "minus big red")}></i>
              {result.message}
            </div>
          ))
        }

        {
          description.map((text, i) => (
            <div key={i}>{text}</div>
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

        <div className="ui small modal" ref="testsSuccessModal">
          <div className="content">
            <h2 style={{textAlign:"center"}}><i className="check big green circle icon"></i>Success</h2>
            <br/><br/>
            <button style={{display:"block", margin:"0 auto"}} onClick={this.nextChallenge.bind(this)} className="positive ui button">
              Next challenge
            </button>
          </div>
        </div>

      </div>
    )
  }

}