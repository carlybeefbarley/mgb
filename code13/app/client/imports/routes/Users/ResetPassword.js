import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Container, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import { showToast } from '/client/imports/routes/App'
import { utilPushTo } from '/client/imports/routes/QLink'
import validate from '/imports/schemas/validate'

const ResetPasswordRoute = React.createClass({
  propTypes: {
    params: PropTypes.object,
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
  },

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

    if (isComplete)
      return (
        <Message
          success
          header="Password reset successful"
          content="You have successfully reset your password and are now logged in."
        />
      )

    return (
      <Form onChange={this.handleChange} onSubmit={this.handleSubmit} loading={isLoading}>
        <Form.Input
          error={!!errors.password}
          icon="lock"
          label={errors.password || 'New password'}
          name="password"
          placeholder="New password"
          type="password"
        />
        <Form.Button primary fluid disabled={!formData.password || !!errors.password}>
          Submit
        </Form.Button>
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
                <Header as="h2" inverted content="Reset password " />
                <Segment stacked>{this.renderContent()}</Segment>
                {errors.server && <Message error content={errors.server} />}
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
    const { params } = this.props
    const { password } = this.state.formData

    const errors = {
      password: validate.passwordWithReason(password),
      server: null,
    }

    if (_.some(errors)) {
      return this.setState({ loading: false, errors })
    }

    this.setState({ isLoading: true })
    Accounts.resetPassword(params.token, password, error => {
      if (error) {
        console.error(error)
        return this.setState({
          isLoading: false,
          errors: { server: error.reason || 'Server Error while resetting password for account' },
        })
      }

      // This is going to cause an auto-login to happen very quickly,
      // and that will also regenerate this React control, so weh ave to do some strange stuff now
      showToast('Password reset was successful', 'success')
      utilPushTo(this.context.urlLocation.query, '/')
      this.setState({ isLoading: false, errors: {}, isComplete: true })
    })
  },
})

export default ResetPasswordRoute
