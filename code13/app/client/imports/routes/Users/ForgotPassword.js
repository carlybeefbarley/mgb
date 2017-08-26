import _ from 'lodash'
import React from 'react'
import { Container, Grid, Message, Segment, Header, Form } from 'semantic-ui-react'
import validate from '/imports/schemas/validate'
import Footer from '/client/imports/components/Footer/Footer'

const ForgotPasswordRoute = React.createClass({
  getInitialState: function() {
    return {
      errors: {},
      isLoading: false,
      isComplete: false,
    }
  },

  render: function() {
    const { isLoading, isComplete, errors } = this.state
    const { currUser } = this.props

    const innerRender = () => {
      if (currUser)
        return (
          <Message
            info
            content="You are logged in already. Once you log out, you may request a password reset"
          />
        )

      if (isComplete)
        return (
          <Message
            success
            header="Password reset request successful"
            content="Please check your email inbox (and also junk folders) for the link to finish resetting your password"
          />
        )

      return (
        <Form
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
          loading={isLoading}
          error={_.isEmpty(errors)}
        >
          <Form.Input
            error={errors.email}
            icon="envelope"
            label={errors.email || 'Email'}
            name="email"
            placeholder="Email"
            type="email"
          />
          <Form.Button fluid primary disabled={errors.email} content="Request reset" />
        </Form>
      )
    }

    return (
      <div>
        <div className="hero" style={{ paddingTop: '3em', paddingBottom: '3em' }}>
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column width={4} only="computer tablet" />
              <Grid.Column>
                <Header as="h2" inverted content="Reset password " />
                <Segment stacked>{innerRender()}</Segment>
                {errors.server && <Message error content={errors.server} />}
              </Grid.Column>
              <Grid.Column width={4} only="computer tablet" />
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
    const { email } = this.state.formData

    const why = validate.emailWithReason(email)
    this.setState({ errors: why ? { email: why } : {} })
    console.log({ email, why })
    if (why) return // if errors showing don't submit

    this.setState({ isLoading: true, formData: {} })
    Accounts.forgotPassword({ email }, error => {
      if (error) {
        this.setState({
          isLoading: false,
          errors: {
            server: error.reason || 'Server Error while requesting password-reset email for account',
          },
        })
      } else {
        this.setState({ isLoading: false, errors: {}, isComplete: true })
      }
    })
  },
})

export default ForgotPasswordRoute
