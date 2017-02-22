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
    // console.log(this.props.code, this.skillNode.$meta.tests)

    const tests = this.skillNode.$meta.tests
    tests.map((test) => {
      console.log(test)
      // const result = eval(test)
    })

  }

  render() {
    return (
      <div className="content">
        <Button size='small' color='green' onClick={this.runTests.bind(this)}>
          <Icon name='play' /> Run tests
        </Button>
        <Button size='small' color='green'>
          <Icon name='refresh' /> Reset code
        </Button>
        <Button size='small' color='green'>
          <Icon name='help' /> Help
        </Button>

      </div>
    )
  }

}


const assert = (param1, param2) => {
  console.log(param1, param2)
}