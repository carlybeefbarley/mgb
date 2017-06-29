import _ from 'lodash'
import React from 'react'
import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import validate from '/imports/schemas/validate'
import Footer from '/client/imports/components/Footer/Footer'

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
        return <Message info content='You are logged in already. Once you log out, you may request a password reset' />

      if (isComplete)
        return <Message success header='Password reset request successful' content='Please check your email inbox (and also junk folders) for the link to finish resetting your password' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
          <Form.Input
            label='Enter your email to reset your password'
            placeholder='Email address'
            onChange={this.handleEmailChange}
            error={!!errors.email} type="email"
          />
          <ErrMsg text={errors.email} />
          <ErrMsg text={errors.result} />
          <Form.Button color='teal'>Request reset</Form.Button>
        </Form>
      )
    }

    return (
      <div>
        <div className='hero' style={{paddingTop: '3em', paddingBottom: '3em'}}>
          <Container text>
            <Segment padded>
              <Header style={{color: 'black'}} as='h2' content='Request a password reset'/>
              { innerRender() }
            </Segment>
          </Container>
        </div>
        <Footer />
      </div>
    )
  },

  handleEmailChange: function(e, { value }) {
    this.setState( (prevState, props) => ({ email: value }) )
  },

  handleSubmit: function(event) {
    const { email } = this.state

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
