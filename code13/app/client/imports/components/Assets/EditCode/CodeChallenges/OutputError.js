import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Segment } from 'semantic-ui-react'

export default class OutputError extends React.Component {
  static propTypes = {
    error: PropTypes.string,
  }

  render() {
    if (!this.props.error) return null
    return (
      <Segment inverted color="red" size="mini" secondary>
        <Icon name="warning sign" />
        {this.props.error}
      </Segment>
    )
  }
}
