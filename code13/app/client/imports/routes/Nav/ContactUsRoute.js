import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Form, Message } from 'semantic-ui-react'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'


class ContactUs extends Component {
  // const username = currUser ? currUser.profile.name : 'guest'
  // const userId = currUser ? currUser._id : null

  constructor(props) {
    super(props)

    this.state = { email: '', comments: '', submittedEmail: '', submittedComments: '' }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  //state = { email: '', comments: '', submittedEmail: '', submittedComments: '' }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = (e, { submittedEmail, email }) => {
    //const { email, comments } = this.state

    this.setState({ submittedEmail: email, submittedComments: comments })
  }

  render() {
    return (
      <HeroLayout
        heroContent={
          <div>
            <Form size='big' inverted success onSubmit={this.handleSubmit}>
              <Form.Input label='Email' name='email' placeholder='Email' value={this.state.email} onChange={this.handleChange} required width={10} />
              <Form.TextArea label="Comments" name='comments' placeholder="Comments" value={this.state.comments} onChange={this.handleChange} required />
              <Message
                success
                header='Thank You!'
                content="We've received your message and will get back to you soon"
              />
              <Form.Button content='Submit' type='submit' />
            </Form>
          </div>
        }
      />
    )
  }
}

// ContactUs.propTypes = {
//   currUser: PropTypes.object, // Can be null/undefined
// }

export default ContactUs