import React from 'react'

import { utilPushTo } from '../QLink'
import { logActivity } from '/imports/schemas/activity'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'

export default SignInRoute = React.createClass({
  
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

    return (
      <Container text>
      <br></br>
        <Segment padded>
          <Header as='h2'>Sign in</Header>
          <Form onSubmit={this.handleSubmit} loading={isLoading} error={!!errorMsg}>
            <Form.Input label='email' name='email' placeholder='Email address' />
            <Form.Input label='password' name='password' placeholder='Password' type='password'/>
            <Message error
              header='Error'
              content={errorMsg} />
            <Form.Button>Submit</Form.Button>
          </Form>
        </Segment>
      </Container>
    )
  },


  handleSubmit: function(e, formData) {
    const { email, password } = formData
    this.setState( { isLoading: true, errorMsg: null } )
    e.preventDefault()

    Meteor.loginWithPassword(email.trim(), password, error => {
      if (error) 
        this.setState( { isLoading: false, errorMsg: error.reason } )
      else 
      {
        var userName = Meteor.user().profile.name
        logActivity("user.login",  `Logging in "${userName}"`, null, null)
        utilPushTo(this.context.urlLocation.query, `/u/${userName}/assets`)
      }
    })
  }
})