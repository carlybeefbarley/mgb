import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Message } from 'semantic-ui-react'

import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'

export default class VerifyEmailRoute extends React.Component{
  static propTypes = {
    params: PropTypes.object,
  }

  state = {
      isLoading: true,
      isVerified: false,
      error: null,
    }

  componentDidMount() {
    Accounts.verifyEmail(this.props.params.token, error => {
      if (error) {
        console.warn(error.reason)
        this.setState({ error: error.reason, isLoading: false })
      } else {
        this.setState({ isVerified: true, isLoading: false })

        refreshBadgeStatus()
      }
    })
  }

  render() {
    if (this.state.isLoading) return <Icon loading />
    else if (this.state.error) return <Message negative header="Error" content={this.state.error} />
    else if (this.state.isVerified)
      return (
        <Message
          success
          header="Email verify successful"
          content="You have successfully verified your email"
        />
      )
    else
      return (
        <Message
          negative
          header="Unknown Error"
          content="Ooops! Something went wrong, please notify our admins in a chat!"
        />
      )
  }
}