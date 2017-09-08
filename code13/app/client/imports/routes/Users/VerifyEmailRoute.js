import _ from 'lodash'
import React, { PropTypes } from 'react'
import { showToast } from '/client/imports/routes/App'
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

        Meteor.call('User.refreshBadgeStatus', (err, re) => {
          if (err) console.log('User.refreshBadgeStatus error', err)
          else {
            if (!re || re.length === 0) console.log(`No New badges awarded`)
            else showToast(`New badges awarded: ${re.join(', ')} `)
          }
        })
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
