import _ from 'lodash'
import React from 'react'
import { Container, Message, Segment, Header, Form, Grid, Image } from 'semantic-ui-react'

import { stopCurrentTutorial } from '/client/imports/routes/App'
import LoginLinks from './LoginLinks'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'
import { logActivity } from '/imports/schemas/activity'
import { showToast } from '/client/imports/routes/App'
import Footer from '/client/imports/components/Footer/Footer'

const ErrMsg = props =>
  props.text
    ? <div style={{ paddingTop: 0, marginTop: '-12px', marginBottom: '10px', color: 'red' }}>
        {props.text}
      </div>
    : null

export default (SignupRoute = React.createClass({
  contextTypes: {
    urlLocation: React.PropTypes.object,
  },

  getInitialState: function() {
    return {
      errors: {},
      isLoading: false,
    }
  },

  fixUsername: function(e) {
    var name = e.target.value || ''
    e.target.value = _.trim(name).replace(/@[A-Za-z]+\.[A-Za-z]+$/, '').replace(/[^A-Za-z0-9_]/g, '')
  },

  checkUserName: function(e) {
    if (e && e.target.value && e.target.value.length > 2)
      Meteor.call('AccountsHelp.userNameTaken', e.target.value, (err, r) => {
        if (!err) {
          const msg = r ? `Username '${r}' has already been taken` : null
          const newErrState = Object.assign({}, this.state.errors, { username: msg })
          this.setState({ errors: newErrState })
        }
      })
  },

  render: function() {
    const { isLoading, errors } = this.state
    const { currUser } = this.props

    // Turn of autocomplete for signup as described at https://bugs.chromium.org/p/chromium/issues/detail?id=370363#c7
    // and at https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields

    const innerRender = () =>
      currUser
        ? <Message info content="You are logged in already!" />
        : <Form
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            loading={isLoading}
            error={_.keys(errors).length > 0}
          >
            <Form.Input
              type="email"
              label="Enter your email address (used for login)"
              name="email"
              placeholder="Email address"
              error={!!errors.email}
            />
            <ErrMsg text={errors.email} />
            <Form.Input
              onBlur={this.checkUserName}
              onChange={this.fixUsername}
              label="Choose a username (used for profile)"
              name="username"
              placeholder="New username (short, no spaces)"
              error={!!errors.username}
            />
            <ErrMsg text={errors.username} />
            <Form.Input
              label="Choose a Password"
              name="password"
              placeholder="New password"
              type="password"
              error={!!errors.password}
              autoComplete="new-password"
            />
            <ErrMsg text={errors.password} />
            <ErrMsg text={errors.result} />
            <Form.Button color="teal">Create Account</Form.Button>
          </Form>

    return (
      <div>
        <div className="hero" style={{ paddingTop: '3em', paddingBottom: '3em' }}>
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column style={{ minWidth: '24em' }}>
                <Segment padded>
                  <Header style={{ color: 'black' }} as="h2">
                    Sign Up
                  </Header>
                  {innerRender()}
                  {!currUser && <LoginLinks showLogin />}
                </Segment>
              </Grid.Column>
              <Grid.Column only="computer">
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
      formData: { ...prevState.formData, [name]: value },
    }))
  },

  handleSubmit: function(event) {
    const { formData } = this.state
    const { email, username, password } = formData
    const errs = {}

    _.each('email,username,password'.split(','), k => {
      const r = validate[k + 'WithReason'](formData[k])
      if (r) errs[k] = r
    })

    this.setState({ errors: errs })

    if (_.keys(errs).length > 0) return

    this.setState({ isLoading: true })
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
}))
