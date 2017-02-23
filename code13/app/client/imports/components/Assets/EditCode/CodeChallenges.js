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

import './editcode.css'

export default class CodeChallenges extends React.Component {

  constructor(props) {
    super(props)

    // console.log(this.props.code)
    
    this.skillNode = this.getSkillNode(props.skillPath)

    this.state = {
      results: []
    }

  }

  componentDidMount() {
    this.getReference()

    window.addEventListener("message", this.receiveMessage.bind(this), false)

  }

  getReference() {
    this.iFrame = ReactDOM.findDOMNode(this.refs.iFrameTests)
  }

  receiveMessage(e){
    if(e.data.prefix && e.data.prefix == 'codeTests'){
      // console.log(e.data.results)
      this.setState({ results: e.data.results })
    }
  }

  getSkillNode(){
    let skillNodes = _.cloneDeep(SkillNodes)
    const path = this.props.skillPath.split('.')
    while(path.length > 0){
      skillNodes = skillNodes[path.shift()]
    }
    return skillNodes
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
        <Button size='small' color='green'>
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

      </div>
    )
  }

}