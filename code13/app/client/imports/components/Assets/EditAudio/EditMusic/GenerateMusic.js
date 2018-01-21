import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import Djent from './djent/Djent.js'

export default class GenerateMusic extends React.Component {
  constructor(props) {
    super(props)
  }

  importAudio = audioObject => {
    this.props.importMusic(audioObject, 'Generated music')
  }

  stop = () => {
    this.refs.djent.stop()
  }

  render() {
    return (
      <div className="content">
        <Djent ref="djent" importAudio={this.importAudio.bind(this)} />
      </div>
    )
  }
}
