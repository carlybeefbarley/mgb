import React from 'react'

import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import { logActivity } from '/imports/schemas/activity'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'


export default LoginRoute = React.createClass({
  
  getInitialState: function()
  {
    return {
      errorMsg:   null,
      isLoading:  false
    }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  render: function() {
    const { isLoading, errorMsg } = this.state
    const { currUser } = this.props

    const innerRender = () => {
      if (currUser)
        return <Message error content='You are logged in already!' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={!!errorMsg}>
          <Form.Input type="email" label='email' name='email' placeholder='Email address' />
          <Form.Input label='password' name='password' placeholder='Password' type='password'/>
          <Message error
            header='Error'
            content={errorMsg} />
          <Form.Button>Submit</Form.Button>
        </Form>
      ) 
    }

    return (
      <Container text>
      <br></br>
        <Segment padded>
          <Header as='h2'>Log In</Header>
          { innerRender() }
          { !currUser && <LoginLinks showLogin={true} showForgot={true} /> }
        </Segment>
      </Container>
    )
  },

  handleSubmit: function(e, formData) {
    e.preventDefault()
    const { email, password } = formData
    this.setState( { isLoading: true, errorMsg: null } )

    Meteor.loginWithPassword(email.trim(), password, error => {
      if (error) 
        this.setState( { isLoading: false, errorMsg: error.reason } )
      else 
      {
        var userName = Meteor.user().profile.name
        logActivity("user.login",  `Logging in "${userName}"`, null, null)
        utilPushTo(this.context.urlLocation.query, `/u/${userName}/assets`)

        analytics.identify(Meteor.user()._id, {
          name: userName,
          email: Meteor.user().emails[0].address
        })
        analytics.track('Logged in')
        analytics.page('login')
      }
    })
  }
})
