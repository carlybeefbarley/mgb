import _ from 'lodash'
import React from 'react'

import { stopCurrentTutorial } from '/client/imports/routes/App'
import LoginLinks from './LoginLinks'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'
import { logActivity } from '/imports/schemas/activity'


const ErrMsg = props => { return props.text ? <Message color='red' content={props.text} /> : null }

export default SignupRoute = React.createClass({

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getInitialState: function() {    
    return {
      errors:     {},
      isLoading:  false
    }
  },

  checkUserName: function (e) {
    if (e && e.target.value && e.target.value.length > 2 )
      Meteor.call('AccountsHelp.userNameTaken', e.target.value, (err,r) => { 
        if (!err) {
          const msg = r ? `Username '${r}' has already been taken` : null
          const newErrState = Object.assign({}, this.state.errors, { username: msg } )
          this.setState( { errors: newErrState } )
        }
      } )
  },

  render: function() {
    const { isLoading, errors } = this.state
    const { currUser } = this.props

    const innerRender = () => {
      if (currUser)
        return <Message error content='You are logged in already!' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
          <Form.Input type="email" label='Email Address (used for login)' name='email' placeholder='Email address' error={!!errors.email} />
          <ErrMsg text={errors.email} />
          <Form.Input onBlur={this.checkUserName} label='Choose your username (used for login and profile)' name='username' placeholder='User Name (short, no spaces)'  error={!!errors.username} />
          <ErrMsg text={errors.username} />
          <Form.Input label='Choose a Password for your new account' name='password' placeholder='Password' type='password'  error={!!errors.password} />
          <ErrMsg text={errors.password} />
          <ErrMsg text={errors.result} />
          <Form.Button>Submit</Form.Button>
        </Form>
      )
    }

    return (
      <Container text>
      <br></br>
        <Segment padded>
          <Header as='h2'>Create your account</Header>
          { innerRender() }
          { !currUser && <LoginLinks showLogin={true} showForgot={true} /> }
        </Segment>
      </Container>
    )
  },

  handleSubmit: function(event, outerFormData) {
    const formData = outerFormData.formData  // formData.formData as of SUIR v0.62.x.. See https://github.com/Semantic-Org/Semantic-UI-React/pull/951
    event.preventDefault()
    const { email, username, password } = formData  
    const errs = {}

    _.each('email,username,password'.split(','), k => {
      const r = validate[k+'WithReason'](formData[k])
      if (r) errs[k] = r
    })

    this.setState( { errors: errs } )

    if (_.keys(errs).length > 0)
      return

    this.setState( { isLoading: true } )
    Accounts.createUser({     // Note that there is server-side validation in /server/CreateUser.js
      email:    email,
      username: username,     // Fixup mshell.sh code was:   _.each(Meteor.users.find().fetch(), function (u) { try { Accounts.setUsername( u._id,  u.profile.name ) } catch (e) { console.log('dupe:',u._id)} } )
      password: password,
      profile: {
        name: username,
        avatar: "http://www.gravatar.com/avatar/" + md5(email.trim().toLowerCase()) + "?s=50&d=mm",  // actual image picked by user to display
        images: ["http://www.gravatar.com/avatar/" + md5(email.trim().toLowerCase()) + "?s=50&d=mm"] // collection of images in users account
      }
    }, error => {
      if (error)
        this.setState( { isLoading: false, errors: { result: error.reason || 'Server Error while creating account' } } )
      else 
      {
        logActivity("user.join",  `New user "${username}"`, null, null)
        stopCurrentTutorial() // It would be weird to continue one, and the main case will be the signup Tutorial        
        utilPushTo(this.context.urlLocation.query, `/learn/getstarted`, { _fp: 'goals'})
        
        analytics.identify(Meteor.user()._id, {
          name: Meteor.user().profile.name,
          email: Meteor.user().emails[0].address
        })
        analytics.track('Signed up')
        analytics.page('/signup')
      }
    })
  }
})
