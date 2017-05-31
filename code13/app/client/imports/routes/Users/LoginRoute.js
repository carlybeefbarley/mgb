import React from 'react'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'

import { stopCurrentTutorial } from '/client/imports/routes/App'

import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import { logActivity } from '/imports/schemas/activity'
import { showToast } from '/client/imports/routes/App'
import Footer from '/client/imports/components/Footer/Footer'
import HomeRoute from '/client/imports/routes/Home'

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

    if (currUser)
      return (
        <div>
          <Segment basic>
            <Message info content='You are logged in already!' />
          </Segment>
          <HomeRoute {...this.props} />
        </div>
      )

    return (
      <div>
        <div className='hero' style={{paddingTop: '3em', paddingBottom: '3em'}}>
          <Container text>
            <Segment padded>
              <Header style={{color:'black'}} as='h2'>Log in</Header>
              <Form onSubmit={this.handleSubmit} loading={isLoading} error={!!errorMsg}>
                <Form.Input type="email" label='email' name='email' placeholder='login using your email address' />
                <Form.Input label='password' name='password' placeholder='enter your password' type='password'/>
                <Message error
                  header='Error'
                  content={errorMsg} />
                <Form.Button color='teal'>Log in</Form.Button>
              </Form>
              <LoginLinks showSignup={true} showForgot={true} />
            </Segment>
          </Container>
        </div>
        <Footer />
      </div>
    )
  },

  handleSubmit: function(e, formData) {
    e.preventDefault()
    const { email, password } = formData.formData  // formData.formData as of SUIR v0.62.x.. See https://github.com/Semantic-Org/Semantic-UI-React/pull/951
    this.setState( { isLoading: true, errorMsg: null } )

    Meteor.loginWithPassword(email.trim(), password, error => {
      if (error) 
        this.setState( { isLoading: false, errorMsg: error.reason } )
      else 
      {
        var userName = Meteor.user().profile.name
        logActivity("user.login",  `Logging in "${userName}"`, null, null)
        stopCurrentTutorial() // It would be weird to continue one, and the main case will be the signup Tutorial
        utilPushTo(this.context.urlLocation.query, `/u/${userName}`)
        showToast("Login ok!  Welcome back")


        // analytics.identify(Meteor.user()._id, {
        //   name: userName,
        //   email: Meteor.user().emails[0].address
        // })
        // analytics.track('Logged in')
        // analytics.page('/login')
        ga('send', 'pageview', '/login')
      }
    })
  }
})
