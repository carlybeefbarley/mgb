import { Accounts } from 'meteor/accounts-base'
import React from 'react'
import { Container, Grid, Message, Segment, Header, Form } from 'semantic-ui-react'

import validate from '/imports/schemas/validate'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import LoginLinks from './LoginLinks'

const ForgotPasswordRoute = React.createClass({
  getInitialState() {
    return {
      errors: {},
      formData: {},
      isLoading: false,
      isComplete: false,
    }
  },

  renderContent() {
    const { isLoading, isComplete, errors, formData } = this.state
    const { currUser } = this.props

    if (currUser)
      return (
        <Message
          info
          content="You are logged in already. Once you log out, you may request a password reset."
        />
      )

    if (isComplete)
      return (
        <Message
          success
          header="Password reset request successful"
          content="Please check your email inbox (and also junk folders) for the link to finish resetting your password."
        />
      )

    return (
      <Form onSubmit={this.handleSubmit} onChange={this.handleChange} loading={isLoading}>
        <Form.Input
          error={!!errors.email}
          icon="envelope"
          label={errors.email || 'Email'}
          name="email"
          placeholder="Email"
          type="email"
        />
        <Form.Button fluid primary disabled={!formData.email || errors.email} content="Request reset" />
      </Form>
    )
  },

  render() {
    const { errors } = this.state

    return (
      <HeroLayout
        heroContent={
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column width={4} only="computer tablet" />
              <Grid.Column>
                <Header as="h2" inverted content="Forgot password " />
                <Segment stacked>{this.renderContent()}</Segment>
                {errors.server && <Message error content={errors.server} />}
                <LoginLinks showLogin="Remember your password? Log in." showSignup />
              </Grid.Column>
              <Grid.Column width={4} only="computer tablet" />
            </Grid>
          </Container>
        }
      />
    )
  },

  handleChange(e) {
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

  handleSubmit(event) {
    const { email } = this.state.formData

    const emailError = validate.emailWithReason(email)

    if (emailError) {
      return this.setState({ errors: { ...this.state.errors, email: emailError } })
    }

    this.setState({ isLoading: true })

    Meteor.call('AccountsHelp.emailTaken', email, (error, isTaken) => {
      if (error) {
        return this.setState({
          isLoading: false,
          errors: {
            ...this.state.errors,
            server: error.reason || 'Server Error while checking if email exists',
          },
        })
      }

      if (!isTaken) {
        return this.setState({
          isLoading: false,
          errors: {
            ...this.state.errors,
            email: `'${email}' is not registered`,
          },
        })
      }

      Accounts.forgotPassword({ email }, error => {
        if (error) {
          const message = error.reason || 'Server Error while requesting password-reset email for account'

          this.setState({
            isLoading: false,
            errors: { server: message },
          })
        } else {
          this.setState({ isLoading: false, errors: {}, isComplete: true })
        }
      })
    })
  },
})

export default ForgotPasswordRoute
