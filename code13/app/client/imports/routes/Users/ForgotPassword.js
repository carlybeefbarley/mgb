import _ from 'lodash'
import React from 'react'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import validate from '/imports/schemas/validate'

const ErrMsg = props => { return props.text ? <Message error color='red' content={props.text} /> : null }

export default ForgotPasswordRoute = React.createClass({

  getInitialState: function() {    
    return {
      errors:     {},
      isLoading:  false,
      isComplete: false
    }
  },

  render: function() {
    const { isLoading, isComplete, errors } = this.state
    const { currUser } = this.props

    const innerRender = () => {
      if (currUser)
        return <Message error content='You are logged in already. Once you log out, you may request a password reset' />

      if (isComplete)
        return <Message success header='Password reset request successful' content='Please check your email inbox (and also junk folders) for the link to finish resetting your password' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
          <Form.Input label='Enter your email to reset your password' name='email' placeholder='Email address' error={!!errors.email} type="email" />
          <ErrMsg text={errors.email} />
          <ErrMsg text={errors.result} />
          <Form.Button>Submit</Form.Button>
        </Form>
      )
    }

    return (
      <Container text>
      <br></br>
        <Segment padded>
          <Header as='h2'>Request a password reset</Header>
          { innerRender() }
        </Segment>
      </Container>
    )
  },

  handleSubmit: function(event, formData) {
    event.preventDefault()
    const { email } = formData.formData  // formData.formData as of SUIR v0.62.x.. See https://github.com/Semantic-Org/Semantic-UI-React/pull/951

    const why = validate.emailWithReason(email)
    this.setState( { errors: why ? { password: why } : {} } )
    if (why)
      return    // if errors showing don't submit

    this.setState( { isLoading: true } )
    Accounts.forgotPassword( { email }, error => {
      if (error)
        this.setState( { isLoading: false, errors: { result: error.reason || 'Server Error while requesting password-reset email for account' } } )
      else
        this.setState( { isLoading: false, errors: {}, isComplete: true } )
    })
  }
})
