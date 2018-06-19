import React, { Component } from 'react'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import LoginLinks from './LoginLinks'
import Recaptcha from '/client/imports/components/Recaptcha/Recaptcha'
import { Container, Grid, Header, Segment, Form, Divider, Message, Image, Button } from 'semantic-ui-react'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles
  pointerEvents: 'none',
}

export default class SignupEducationRoute extends Component {
  state = {
    errors: {},
    formData: {},
    isLoading: false,
    isRecaptchaComplete: false,
  }

  render() {
    const { isLoading, errors, formData, isRecaptchaComplete } = this.state
    const { currUser } = this.props

    return (
      <HeroLayout
        heroContent={
          <Container text>
            <Grid padded columns="equal" verticalAlign="middle">
              <Grid.Column>
                <Header as="h2" inverted content="Sign Up" />
                <Segment stacked>
                  <Form onChange={this.handleChange} loading={isLoading}>
                    <Form.Input
                      error={!!errors.email}
                      icon="university"
                      label={errors.email || 'Institution'}
                      name="institution"
                      onBlur={this.checkEmail}
                      placeholder="Clark County High"
                      type="institution"
                    />
                    <Form.Input
                      error={!!errors.email}
                      icon="envelope"
                      label={errors.email || 'Email'}
                      name="email"
                      onBlur={this.checkEmail}
                      placeholder="c.woodstock@CCH.edu"
                      type="email"
                    />
                    <Form.Input
                      error={!!errors.username}
                      icon="user"
                      label={errors.username || 'Username (used for profile)'}
                      name="username"
                      onBlur={this.checkUserName}
                      placeholder="Mrs. Woodstock"
                    />
                    <Form.Input
                      // Turn of autocomplete for signup as described at https://bugs.chromium.org/p/chromium/issues/detail?id=370363#c7
                      // and at https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#The_autocomplete_attribute_and_login_fields
                      autoComplete="new-password"
                      error={!!errors.password}
                      icon="lock"
                      type="password"
                      label={errors.password || 'Password'}
                      name="password"
                      placeholder="Password"
                    />
                    <Form.Field
                      disabled={
                        !formData.email ||
                        !formData.username ||
                        !formData.password ||
                        errors.email ||
                        errors.username ||
                        errors.password
                      }
                    >
                      <Recaptcha onComplete={this.handleRecaptchaComplete} invisible>
                        <Button fluid primary content="Submit Application" />
                      </Recaptcha>
                    </Form.Field>
                  </Form>
                </Segment>
                {errors.server && <Message error content={errors.server} />}
                {!currUser && <LoginLinks showLogin />}
              </Grid.Column>
              <Grid.Column width={8} only="tablet computer" style={mascotColumnStyle}>
                <Divider hidden section />
                <Image src="/images/mascots/team.png" />
              </Grid.Column>
            </Grid>
          </Container>
        }
      />
    )
  }
}
