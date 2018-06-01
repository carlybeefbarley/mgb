import React, { Component } from 'react'
import _ from 'lodash'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import validate from '/imports/schemas/validate'
import { Container, Grid, Header, Segment, Form, Divider, Message, Image, Button } from 'semantic-ui-react'
import LoginLinks from '../Users/LoginLinks'
import Recaptcha from '/client/imports/components/Recaptcha/Recaptcha'

const mascotColumnStyle = {
  // allow click through, so users can play with the particles
  pointerEvents: 'none',
}

const salutations = [
  { key: 0, text: 'Mr.', value: 0 },
  { key: 1, text: 'Mrs.', value: 1 },
  { key: 2, text: 'Ms.', value: 2 },
  { key: 3, text: 'Dr.', value: 3 },
  { key: 4, text: 'Prof.', value: 4 },
  { key: 5, text: 'A.H.', value: 5 },
]

export default class DevPanelRoute extends Component {
  state = {
    errors: {},
    formData: { salutation: 0 },
    isLoading: false,
    isRecaptchaComplete: false,
    salutationIndex: 0,
  }

  handleSubmit = event => {
    const { institution, email, username, password } = this.state.formData
    const { salutationIndex } = this.state
    const salutation = salutations[salutationIndex].text

    const errors = {
      email: validate.emailWithReason(email),
      username: validate.usernameWithReason(username),
      password: validate.passwordWithReason(password),
    }

    let data = {
      username,
      email,
      password,
      profile: {
        name: username,
        institution,
        salutation,
        students: [
          { _id: 'Sdjfkl2Ds9xDhgRp', username: 'Edward Jamison' },
          { _id: 'Sdjfkl2Ds9xDhgRp', username: 'Edward Jamison' },
          { _id: 'Sdjfkl2Ds9xDhgRp', username: 'Edward Jamison' },
        ], // Array of user ID/Name pairs that point to which users belong to this teacher.
        isTeacher: true,
      },
    }

    if (_.some(errors)) {
      this.setState({ errors })
      return
    }
    console.log('Creating account with: ', data)

    Accounts.createUser(data, error => {
      if (error) {
        console.error(error)
        return this.setState({
          isLoading: false,
          errors: { server: error.reason || 'Server Error while creating account' },
        })
      }
    })
  }

  handleChange = e => {
    const { name, value } = e.target
    console.dir(e.target.value)
    if (value) {
      this.setState((prevState, props) => {
        return {
          formData: {
            ...prevState.formData,
            [name]: value,
          },
        }
      })
    }
  }

  handleSelect = event => {
    const salutationIndex = _.find(salutations, { text: event.target.innerText })

    if (salutationIndex !== undefined) {
      this.setState({ salutationIndex: salutationIndex.value })
    }
  }

  handleRecaptchaComplete = () => {
    return true
  }

  render() {
    const { isLoading, errors, formData, isRecaptchaComplete } = this.state
    const { currUser } = this.props

    let renderItem

    if (true) {
      renderItem = (
        <HeroLayout
          heroContent={
            <Segment>
              <Header color="red">FOR DEVELOPMENT ONLY</Header>
              <Divider />
              <Container text>
                <Grid padded columns="equal" verticalAlign="middle">
                  <Grid.Column>
                    <Header as="h2" inverted content="Sign Up" />
                    <Segment stacked>
                      <Form
                        onChange={this.handleChange}
                        onSubmit={e => this.handleSubmit(e)}
                        loading={isLoading}
                      >
                        <Form.Input
                          icon="university"
                          label={'Institution'}
                          name="institution"
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
                        <Form.Select
                          label={'Salutation'}
                          name="salutation"
                          value={this.state.salutationIndex}
                          options={salutations}
                          onChange={e => this.handleSelect(e)}
                        />
                        <Form.Input
                          error={!!errors.username}
                          icon="user"
                          label={errors.username || 'Username (used for profile)'}
                          name="username"
                          onBlur={this.checkUserName}
                          placeholder={`${salutations[this.state.salutationIndex].text} Woodstock`}
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
                        <Button fluid primary content="Submit Application" />
                        <Button
                          fluid
                          color="red"
                          content="FORCE"
                          onClick={e => {
                            this.handleSubmit(e)
                          }}
                        />
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
                <Divider />
                <Segment>Some other stuff goes here</Segment>
              </Container>
            </Segment>
          }
        />
      )
    } else {
      renderItem = <div style={{ color: 'red' }}> YOU ARE NOT WELCOME HERE </div>
    }
    return renderItem
  }
}
