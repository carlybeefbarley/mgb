import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Message, Button } from 'semantic-ui-react'

export default class ChallengeCompleted extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    loading: PropTypes.bool,
    onStartNext: PropTypes.func,
  }

  render() {
    if (!this.props.show) return null

    return (
      <Message size="tiny" icon success>
        <Icon color="green" name="check circle" />
        <Message.Content>
          <Message.Header>Success</Message.Header>
          <p>
            <Button
              positive
              compact
              loading={this.props.loading}
              size="small"
              content="Start next challenge"
              disabled={this.props.loading}
              icon="right arrow"
              labelPosition="right"
              onClick={this.props.onStartNext}
            />
          </p>
        </Message.Content>
      </Message>
    )
  }
}
