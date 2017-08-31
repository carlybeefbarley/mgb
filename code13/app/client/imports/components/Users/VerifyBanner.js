import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Icon, Segment } from 'semantic-ui-react'

class VerifyBanner extends Component {
  static propTypes = {
    currUser: PropTypes.object,
  }

  state = {
    isLoading: false,
    isSent: false,
  }

  sendVerifyEmail = () => {
    this.setState({ isLoading: true })
    Meteor.call('User.sendVerifyEmail', error => {
      if (error) console.log('Could not update profile: ', error.reason)
      else {
        this.setState({ isLoading: false, isSent: true })
      }
    })
  }

  render() {
    const { currUser } = this.props
    const { isLoading, isSent } = this.state

    if (!currUser || _.get(currUser, 'emails[0].verified')) return null

    return (
      <Segment inverted color="orange" textAlign="center" style={{ margin: 0 }}>
        <Icon name="warning sign" inverted />
        Your email is not verified, please check your email or &nbsp;
        <Button
          basic
          compact
          inverted
          size="mini"
          icon="envelope"
          loading={isLoading}
          onClick={this.sendVerifyEmail}
          content={isSent ? 'Verification email sent' : 'Resend verification email'}
        />
      </Segment>
    )
  }
}

export default VerifyBanner
