import _ from 'lodash'
import React from 'react'
import LoginLinks from './LoginLinks'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'
import { logActivity } from '/imports/schemas/activity'


const ErrMsg = props => { return props.text ? <Message error color='red' content={props.text} /> : null }

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

  render: function() {
    const { isLoading, errors } = this.state
    const { currUser } = this.props

    const innerRender = () => {
      if (currUser)
        return <Message error content='You are logged in already!' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
          <Form.Input label='Email Address (used for login)' name='email' placeholder='Email address' error={!!errors.email} />
          <ErrMsg text={errors.email} />
          <Form.Input label='Choose your username (used for your profile and messaging)' name='username' placeholder='User Name (short, no spaces)'  error={!!errors.username} />
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

  handleSubmit: function(event, formData) {
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
    Accounts.createUser({
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
        utilPushTo(this.context.urlLocation.query, `/u/${Meteor.user().profile.name}`)
      }
    })
  }
})
