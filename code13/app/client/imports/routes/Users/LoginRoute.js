import _ from 'lodash'
import React from 'react'
import { Container, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'

import { stopCurrentTutorial } from '/client/imports/routes/App'

import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import { logActivity } from '/imports/schemas/activity'
import validate from '/imports/schemas/validate'
import { showToast } from '/client/imports/routes/App'
import Footer from '/client/imports/components/Footer/Footer'

const LoginRoute = React.createClass({
  getInitialState: function() {
    return {
      errors: {},
      isLoading: false,
      formData: {},
    }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
  },

  render: function() {
    const { isLoading, errors } = this.state
    const { currUser } = this.props

    if (currUser) {
      utilPushTo(null, `/u/${currUser.username}`)
      return null
    }

    return (
      <div>
        <div className="hero" style={{ paddingTop: '3em', paddingBottom: '3em' }}>
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column width={4} only="computer tablet" />
              <Grid.Column>
                <Header as="h2" inverted content="Log in" />
                <Segment stacked>
                  <Form onChange={this.handleChange} onSubmit={this.handleSubmit} loading={isLoading}>
                    <Form.Input
                      error={errors.email}
                      icon="envelope"
                      label={errors.email || 'Email'}
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                    <Form.Input
                      error={errors.password}
                      icon="lock"
                      label={errors.password || 'Password'}
                      name="password"
                      placeholder="Password"
                      type="password"
                    />
                    <Form.Button
                      fluid
                      color="teal"
                      disabled={errors.email || errors.password}
                      content="Log in"
                    />
                  </Form>
                </Segment>
                {errors.server && <Message error content={errors.server} />}
                <LoginLinks showSignup showForgot />
              </Grid.Column>
              <Grid.Column width={4} only="computer tablet" />
            </Grid>
          </Container>
        </div>
        <Footer />
      </div>
    )
  },

  handleChange: function(e) {
    const { name, value } = e.target

    this.setState((prevState, props) => ({
      errors: {
        ...prevState.errors,
        // if a field had an error, provide continual validation
        [name]: prevState.errors[name] ? validate[name + 'WithReason'](value) : null,
      },
      formData: { ...prevState.formData, [name]: value },
    }))
  },

  doLogin() {
    const { email, password } = this.state.formData

    this.setState((prevState, props) => ({
      isLoading: true,
      errors: { ...prevState.errors, server: null },
    }))

    Meteor.loginWithPassword(email.trim(), password, error => {
      if (error) {
        this.setState((prevState, props) => ({
          isLoading: false,
          errors: { ...prevState.errors, server: error.reason },
        }))
      } else {
        var userName = Meteor.user().profile.name
        logActivity('user.login', `Logging in "${userName}"`, null, null)
        stopCurrentTutorial() // It would be weird to continue one, and the main case will be the signup Tutorial
        utilPushTo(this.context.urlLocation.query, `/u/${userName}`)
        showToast('Login ok!  Welcome back')

        // analytics.identify(Meteor.user()._id, {
        //   name: userName,
        //   email: Meteor.user().emails[0].address
        // })
        // analytics.track('Logged in')
        // analytics.page('/login')
        ga('send', 'pageview', '/login')
      }
    })
  },

  handleSubmit: function(e) {
    const { email, password } = this.state.formData

    const errors = {
      email: validate.emailWithReason(email),
      password: validate.passwordWithReason(password),
      server: null,
    }

    if (_.some(errors)) {
      this.setState({ loading: false, errors })
      return
    }

    this.doLogin(email, password)
  },
})

export default LoginRoute
