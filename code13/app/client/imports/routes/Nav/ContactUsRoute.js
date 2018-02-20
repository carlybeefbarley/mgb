import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Form, Message, Header, Container, Grid } from 'semantic-ui-react'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'

Meteor.methods({
  submitted(text) {
    throw new Meteor.Error(
      401,
      `Asset name contains offensive/disrespectful words. Please avoid such words/topics here so that everyone is able to participate comfortably: '${text}'`,
    )
  },
})

class ContactUs extends Component {
  // const username = currUser ? currUser.profile.name : 'guest'
  // const userId = currUser ? currUser._id : null

  state = { email: '', message: '', submittedEmail: '', submittedMessage: '' }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = e => {
    const { email, message } = this.state
    console.dir({ submittedEmail: email, submittedMessage: message })
    //    this.setState({ submittedEmail: email, submittedComments: comments })

    Meteor.call('submitted', this.props.submittedEmail, this.props.submittedMessage)
  }

  render() {
    return (
      <HeroLayout
        heroContent={
          <Container text>
            <Grid columns="equal" verticalAlign="middle">
              <Grid.Column width={2} only="computer tablet" />
              <Grid.Column>
                <Header as="h1" inverted textAlign="center">
                  We Would Love to Hear From You! <br />
                  <br />
                </Header>
                <Form size="big" inverted success onSubmit={this.handleSubmit}>
                  <Form.Input
                    label="Email"
                    name="email"
                    placeholder="Email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    required
                  />
                  <Form.TextArea
                    label="Message"
                    name="message"
                    placeholder="Message"
                    value={this.state.comments}
                    onChange={this.handleChange}
                    required
                  />
                  {/* <Message
                    success
                    header="Thank You!"
                  content="We've received your message and will get back to you soon"
                  /> */}
                  <Form.Button content="Submit" type="submit" />
                </Form>
              </Grid.Column>
              <Grid.Column width={2} only="computer tablet" />
            </Grid>
          </Container>
        }
      />
    )
  }
}

// ContactUs.propTypes = {
//   currUser: PropTypes.object, // Can be null/undefined
// }

export default ContactUs
