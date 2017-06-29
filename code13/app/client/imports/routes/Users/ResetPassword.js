import _ from 'lodash'
import React, { PropTypes } from 'react'
import { showToast } from '/client/imports/routes/App'

import { Container, Message, Segment, Header, Form } from 'semantic-ui-react'
import { utilPushTo } from '/client/imports/routes/QLink'
import validate from '/imports/schemas/validate'

const ErrMsg = props => { return props.text ? <Message error color='red' content={props.text} /> : null }

export default ResetPasswordRoute = React.createClass({

  propTypes: {
    params: PropTypes.object
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      errors:     {},
      isLoading:  false,
      isComplete: false
    }
  },

  render: function() {
    const { isLoading, isComplete, errors } = this.state

    const innerRender = () => {
      if (isComplete)
        return <Message success header='Password reset successful' content='You have successfully reset your password and are now logged in' />

      return (
        <Form onSubmit={this.handleSubmit} loading={isLoading} error={_.keys(errors).length > 0}>
          <Form.Input
            label='Enter your new password'
            name='password'
            placeholder='Password'
            onChange={this.handlePasswordChange}
            type='password'
            error={!!errors.password}
          />
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
          <Header as='h2'>Reset your password</Header>
          { innerRender() }
        </Segment>
      </Container>
    )
  },

  handlePasswordChange: function(e, { value }) {
    this.setState( (prevState, props) => ({ password: value }) )
  },

  handleSubmit: function(event) {
    const { password } = this.state

    const why = validate.passwordWithReason(password)
    this.setState( { errors: why ? { password: why } : {} } )
    if (why)
      return    // if errors showing don't submit

    this.setState( { isLoading: true } )
    Accounts.resetPassword(this.props.params.token, password, error => {
      if (error)
        this.setState( { isLoading: false, errors: { result: error.reason  || 'Server Error while resetting password for account' } } )
      else
      {
        // This is going to cause an auto-login to happen very quickly, and that will also regenerate this React control, so we
        // Have to do some strange stuff now
        showToast("Password reset was successful", 'success')
        utilPushTo(this.context.urlLocation.query, "/")
        this.setState( { isLoading: false, errors: {}, isComplete: true } )
      }
    })
  }
})
