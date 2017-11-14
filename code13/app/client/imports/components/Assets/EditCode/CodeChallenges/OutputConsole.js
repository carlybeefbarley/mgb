import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Divider } from 'semantic-ui-react'

export default class OutputConsole extends React.Component {
  static propTypes = {
    console: PropTypes.string,
  }

  render() {
    if (!this.props.console) return null

    return (
      <div>
        <Divider horizontal>Console output</Divider>

        <Segment inverted size="mini" secondary>
          {this.props.console}
        </Segment>
      </div>
    )
  }
}
