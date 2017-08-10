import _ from 'lodash'
import React from 'react'
import { Container, Divider, Message, Segment, Header, Form, Grid, Image } from 'semantic-ui-react'

import { stopCurrentTutorial } from '/client/imports/routes/App'
import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'
import { logActivity } from '/imports/schemas/activity'
import Footer from '/client/imports/components/Footer/Footer'

const SignupRoute = React.createClass({
  contextTypes: {
    urlLocation: React.PropTypes.object,
  },

  getInitialState: function() {
    return {
      errors: {},
      isLoading: false,
    }
  },

  checkUserName: function(e) {
    if (e && e.target.value && e.target.value.length > 2)
      Meteor.call('AccountsHelp.userNameTaken', e.target.value, (err, response) => {
        if (!err) {
          const message = response ? `Username '${response}' has already been taken` : null
          this.setState({ errors: { ...this.state.errors, username: message } })
        }
      })
  },

  render: function() {
    const { isLoading, errors } = this.state
    const { currUser } = this.props

    if (currUser) {
      utilPushTo(null, `/u/${currUser.username}`)
      return null
    }

    // Turn of autocomplete for signup as described at https://bugs.chromium.org/p/chromium/issues/detail?id=370363#c7
    // and at https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields

    return (
      <div>
        <div className="hero" style={{ paddingTop: '3em', paddingBottom: '3em' }}>
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column>
                <Header as="h2" inverted content="Sign Up" />
                <Segment stacked>
                  <Form
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                    loading={isLoading}
                    error={_.some(errors)}
                  >
                    <Form.Input
                      error={!!errors.email}
                      icon="envelope"
                      label={errors.email || 'Email'}
                      name="email"
                      placeholder="Email"
                      type="email"
                    />
                    <Form.Input
                      error={!!errors.username}
                      icon="user"
                      label={errors.username || 'Username'}
                      name="username"
                      onBlur={this.checkUserName}
                      onChange={this.handleChange}
                      placeholder="Username"
                    />
                    <Form.Input
                      autoComplete="new-password"
                      error={!!errors.password}
                      icon="lock"
                      type="password"
                      label={errors.password || 'Password'}
                      name="password"
                      placeholder="Password"
                    />
                    <Form.Button
                      color="teal"
                      fluid
                      disabled={errors.email || errors.username || errors.password}
                      content="Create Account"
                    />
                    <Message error content={errors.result} />
                  </Form>
                </Segment>
                {!currUser && <LoginLinks showLogin />}
              </Grid.Column>
              <Grid.Column width={8} only="tablet computer">
                <Divider hidden section />
                <Image src="/images/mascots/team.png" />
              </Grid.Column>
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

  handleSubmit: function(event) {
    const { formData = {} } = this.state
    const { email, username, password } = formData
    const errors = {
      email: validate.emailWithReason(email),
      username: validate.usernameWithReason(username),
      password: validate.passwordWithReason(password),
    }

    if (_.some(errors)) {
      this.setState({ errors })
      return
    }

    this.setState({ isLoading: true, errors: null })
    Accounts.createUser(
      {
        // Note that there is server-side validation in /server/CreateUser.js
        email: email,
        username: username, // Fixup mshell.sh code was:   _.each(Meteor.users.find().fetch(), function (u) { try { Accounts.setUsername( u._id,  u.profile.name ) } catch (e) { console.log('dupe:',u._id)} } )
        password: password,
        profile: {
          name: username,
          avatar: '//www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?s=155&d=mm', // actual image picked by user to display
          images: ['//www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?s=155&d=mm'], // collection of images in users account
        },
      },
      error => {
        if (error)
          this.setState({
            isLoading: false,
            errors: { result: error.reason || 'Server Error while creating account' },
          })
        else {
          Meteor.call('User.sendSignUpEmail', email)
          logActivity('user.join', `New user "${username}"`, null, null)
          stopCurrentTutorial() // It would be weird to continue one, and the main case will be the signup Tutorial
          utilPushTo(this.context.urlLocation.query, '/learn/getstarted')

          // analytics.identify(Meteor.user()._id, {
          //   name: Meteor.user().profile.name,
          //   email: Meteor.user().emails[0].address
          // })
          // analytics.track('Signed up')
          // analytics.page('/signup')
          // showToast("Sign up ok!  Welcome aboard")
          ga('send', 'pageview', '/signup')
          ga('send', 'pageview', '/login')
        }
      },
    )
  },
})

export default SignupRoute
