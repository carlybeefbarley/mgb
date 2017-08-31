import _ from 'lodash'
import React, { PropTypes } from 'react'

import { Icon, Message } from 'semantic-ui-react'

const VerifyEmailRoute = React.createClass({
  propTypes: {
    params: PropTypes.object,
  },

  getInitialState: function() {
    return {
      isLoading: true,
      isVerified: false,
      error: null,
    }
  },

  componentDidMount() {
    Accounts.verifyEmail(this.props.params.token, error => {
      if (error) {
        console.warn(error.reason)
        this.setState({ error: error.reason, isLoading: false })
      } else {
        this.setState({ isVerified: true, isLoading: false })
      }
    })
  },

  render: function() {
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
  },
})

export default VerifyEmailRoute
