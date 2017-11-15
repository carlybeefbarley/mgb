import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Container, Divider, Message, Segment, Header, Form, Grid, Image } from 'semantic-ui-react'

import { stopCurrentTutorial } from '/client/imports/routes/App'
import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import { logActivity } from '/imports/schemas/activity'
import HeroLayout from '/client/imports/layouts/HeroLayout'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles :)
  pointerEvents: 'none',
}

class SignupRoute extends Component {
  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  state = {
    errors: {},
    formData: {},
    isLoading: false,
  }

  checkEmail = e => {
    const email = e.target.value

    // don't clear existing errors
    if (this.state.errors.email) return

    const reason = validate.emailWithReason(email)
    if (reason) {
      return this.setState({ errors: { ...this.state.errors, email: reason } })
    }

    Meteor.call('AccountsHelp.emailTaken', email, (err, response) => {
      if (err) return console.error(err)

      const message = response ? `'${email}' is taken` : null
      this.setState({ errors: { ...this.state.errors, email: message } })
    })
  }

  checkUserName = e => {
    const username = e.target.value

    // don't clear existing errors
    if (this.state.errors.username) return

    const reason = validate.usernameWithReason(username)
    if (reason) {
      return this.setState({ errors: { ...this.state.errors, username: reason } })
    }

    Meteor.call('AccountsHelp.userNameTaken', username, (err, response) => {
      if (err) return console.error(err)

      const message = response ? `'${username}' is taken` : null
      this.setState({ errors: { ...this.state.errors, username: message } })
    })
  }

  handleChange = e => {
    const { name, value } = e.target
    this.setState((prevState, props) => ({
      errors: {
        ...prevState.errors,
        // if a field had an error, provide continual validation
        [name]: prevState.errors[name] ? validate[name + 'WithReason'](value) : null,
      },
      formData: { ...prevState.formData, [name]: value },
    }))
  }

  handleSubmit = event => {
    const { formData = {} } = this.state
    const { email, username, password } = formData
    const errors = {
      email: validate.emailWithReason(email),
      username: validate.usernameWithReason(username),
      password: validate.passwordWithReason(password),
    }

    if (_.some(errors)) {
      return this.setState({ errors })
    }

    this.setState({ isLoading: true, errors })
    Accounts.createUser(
      {
        // Note that there is server-side validation in /server/CreateUser.js
        email,
        username, // Fixup mshell.sh code was:   _.each(Users.find().fetch(), function (u) { try { Accounts.setUsername( u._id,  u.profile.name ) } catch (e) { console.log('dupe:',u._id)} } )
        password,
        profile: {
          name: username,
        },
      },
      error => {
        if (error) {
          console.error(error)
          return this.setState({
            isLoading: false,
            errors: { server: error.reason || 'Server Error while creating account' },
          })
        }

        Meteor.call('User.sendSignUpEmail', email)
        logActivity('user.join', `New user "${username}"`, null, null)
        stopCurrentTutorial() // It would be weird to continue one, and the main case will be the signup Tutorial
        utilPushTo(this.context.urlLocation.query, '/dashboard')

        // analytics.identify(Meteor.user()._id, {
        //   name: Meteor.user().profile.name,
        //   email: Meteor.user().emails[0].address
        // })
        // analytics.track('Signed up')
        // analytics.page('/signup')
        // showToast("Sign up ok!  Welcome aboard")
        ga('send', 'pageview', '/signup')
        ga('send', 'pageview', '/login')
      },
    )
  }

  render() {
    const { isLoading, errors, formData } = this.state
    const { currUser } = this.props

    if (currUser) {
      utilPushTo(null, `/u/${currUser.username}`)
      return null
    }

    return (
      <HeroLayout
        heroContent={
          <Container text>
            <Grid padded columns="equal" verticalAlign="middle">
              <Grid.Column>
                <Header as="h2" inverted content="Sign Up" />
                <Segment stacked>
                  <Form onChange={this.handleChange} onSubmit={this.handleSubmit} loading={isLoading}>
                    <Form.Input
                      error={!!errors.email}
                      icon="envelope"
                      label={errors.email || 'Email'}
                      name="email"
                      onBlur={this.checkEmail}
                      placeholder="Email"
                      type="email"
                    />
                    <Form.Input
                      error={!!errors.username}
                      icon="user"
                      label={errors.username || 'Username (used for profile)'}
                      name="username"
                      onBlur={this.checkUserName}
                      placeholder="Username"
                    />
                    <Form.Input
                      // Turn of autocomplete for signup as described at https://bugs.chromium.org/p/chromium/issues/detail?id=370363#c7
                      // and at https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields
                      autoComplete="new-password"
                      error={!!errors.password}
                      icon="lock"
                      type="password"
                      label={errors.password || 'Password'}
                      name="password"
                      placeholder="Password"
                    />
                    <Form.Button
                      primary
                      fluid
                      disabled={
                        !formData.email ||
                        !formData.username ||
                        !formData.password ||
                        errors.email ||
                        errors.username ||
                        errors.password
                      }
                      content="Create Account"
                    />
                  </Form>
                </Segment>
                {errors.server && <Message error content={errors.server} />}
                {!currUser && <LoginLinks showLogin />}
              </Grid.Column>
              <Grid.Column width={8} only="tablet computer" style={mascotColumnStyle}>
                <Divider hidden section />
                <Image src="/images/mascots/team.png" />
              </Grid.Column>
            </Grid>
          </Container>
        }
      />
    )
  }
}

export default SignupRoute
