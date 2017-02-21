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

import './editcode.css'

export default class CodeChallenges extends React.Component {

  constructor(props) {
    super(props)

    // console.log(this.props.code)

    this.state = {
      
    }

  }

  runTests(){
    console.log(this.props.code)
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