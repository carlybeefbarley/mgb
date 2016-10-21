import _ from 'lodash'
import React from 'react'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import { utilPushTo } from '../QLink'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'
import { logActivity } from '/imports/schemas/activity'

export default JoinRoute = React.createClass({

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

    return (
      <Container text>
      <br></br>
        <Segment padded>
          <Header as='h2'>Create your account</Header>
          <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
            <Form.Input label='Email Address (used for login)' name='email' placeholder='Email address' error={!!errors.email} />
            { errors.email && <Message error content={errors.email} /> }
            <Form.Input label='Choose your username (used for your profile)' name='username' placeholder='User Name (short, no spaces)'  error={!!errors.username} />
            { errors.username && <Message error content={errors.username} /> }
            <Form.Input label='Password' name='password' placeholder='Password' type='password'  error={!!errors.password} />
            { errors.password && <Message error content={errors.password} /> }
            { errors.result && <Message error content={errors.result} /> }
            <Form.Button>Submit</Form.Button>
          </Form>
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
    }, (error, result) => {
      if (error)
      {
        debugger
        this.setState( { isLoading: false, errors: { result: error.reason || 'Server Error while creating account' } } )
      }
      else 
      {
        logActivity("user.join",  `New user "${username}"`, null, null)
        utilPushTo(this.context.urlLocation.query, `/u/${Meteor.user().profile.name}`)
      }
    })
  }
})
