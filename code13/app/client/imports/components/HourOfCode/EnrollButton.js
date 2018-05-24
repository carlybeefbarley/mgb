import _ from 'lodash'
import { HTTP } from 'meteor/http'
import React, { Component } from 'react'

import { Icon, Input, Button } from 'semantic-ui-react'

import validate from '/imports/schemas/validate'
import Hotjar from '/client/imports/helpers/hotjar'
import { showToast } from '../../modules'

class EnrollButton extends Component {
  state = {
    showForm: false,
    email: '',
    username: '',
    errors: {},
    hasValidated: false,
  }

  componentDidUpdate(prevProps, prevState) {
    const hasVisibleError = this.state.hasValidated && _.some(this.state.errors)
    const prevHasVisibleError = prevState.hasValidated && _.some(this.state.errors)

    // Popup error hack
    // Controlled popup does not calculate position on first render, force a render after it opens
    if (hasVisibleError !== !prevHasVisibleError) {
      setTimeout(() => this.forceUpdate)
    }
  }

  handleEmailChange = e => {
    const email = e.target.value
    const error = validate.emailWithReason(email)

    this.setState({
      email,
      errors: { ...this.state.errors, email: error },
      hasValidated: false,
    })
  }

  handleUsernameChange = e => {
    const username = e.target.value
    const error = validate.usernameWithReason(username)

    this.setState({
      username,
      errors: { ...this.state.errors, username: error },
      hasValidated: false,
    })
  }

  handleEmailKeyDown = e => e.keyCode === 13 && this.enroll()
  handleUsernameKeyDown = e => e.keyCode === 13 && this.enroll()

  showForm = () => {
    const { email = '', username = '' } = this.state
    this.setState({ email, username, showForm: true }, this.focusUsernameInput)
  }

  hideInput = () => this.setState({ showForm: false })

  focusInput = selector => {
    // wait for Popup to mount the Input `trigger`
    setTimeout(() => {
      const $input = document.querySelector(selector)

      if ($input) {
        $input.focus()
        if ($input.value) $input.select()
      }
    })
  }

  focusEmailInput = () => this.focusInput('#mgb-hoc-save-my-work-email-input')
  focusUsernameInput = () => this.focusInput('#mgb-hoc-save-my-work-username-input')

  enroll = () => {
    Hotjar('vpv', '/hour-of-code/user-enroll:start')
    this.setState(() => ({ isRequestInProgress: true }))

    Promise.all([this.validateUsername(), this.validateEmail()])
      .then(() => {
        const { email, username } = this.state

        return new Promise((resolve, reject) => {
          HTTP.call(
            'POST',
            `/api/user/enroll`,
            { data: { email, username, profile: { name: username } } },
            (error, { data: user }) => {
              console.log('Enroll user', typeof user, user)
              console.log('Enroll error', typeof error, error)
              const email = _.get(user, 'emails[0].address')
              this.setState(() => ({ isRequestInProgress: false }))

              if (error) {
                showToast.error(`Couldn't enroll "${email}". Try again!`, {
                  title: 'Whoa!',
                })
                console.error('Failed to enroll new user', error)
                return reject(error)
              }

              showToast.success(`Check "${email}" for further instructions.`, {
                title: 'Email Sent!',
              })
              Hotjar('vpv', '/hour-of-code/user-enroll:success')
              this.hideInput()
              resolve(user)
            },
          )
        })
      })
      .catch(err => {
        console.error(err)
        Hotjar('vpv', '/hour-of-code/user-enroll:fail')
        this.setState(() => ({ isRequestInProgress: false }))
      })
  }

  validateEmail = () => {
    console.log('validateEmail')
    return new Promise((resolve, reject) => {
      this.setState({ hasValidatedEmail: true })
      const { email } = this.state
      console.log('...Saving email')

      // don't clear existing error
      if (this.state.errors.email) {
        this.focusEmailInput()
        return reject(new Error('Existing email error must be resolved before saving.'))
      }

      console.log('...No existing email errors')

      const reason = validate.emailWithReason(email)
      if (reason) {
        this.focusEmailInput()
        this.setState({ errors: { ...this.state.errors, email: reason } })
        return reject(new Error('Invalid email: ' + reason))
      }

      console.log('...No new email validation errors')

      Meteor.call('AccountsHelp.emailTaken', email, (err, response) => {
        if (err) {
          console.error(err)
          return reject(new Error('Sever error when checking emailTaken: ' + err))
        }

        console.log('...No server error checking email ')

        const message = response ? `'${email}' is taken` : null
        this.setState({ errors: { ...this.state.errors, email: message } })
        if (message) {
          this.focusEmailInput()
          return reject(new Error('Email is already taken.'))
        }

        console.log('...email is not taken, resolve()')

        resolve()
      })
    })
  }

  validateUsername = () => {
    console.log('validateUsername')
    return new Promise((resolve, reject) => {
      this.setState({ hasValidatedUsername: true })
      const { username } = this.state
      console.log('...Saving username')

      // don't clear existing error
      if (this.state.errors.username) {
        this.focusUsernameInput()
        return reject(new Error('Existing username error must be resolved before saving.'))
      }

      console.log('...No existing username errors')

      const reason = validate.usernameWithReason(username)
      if (reason) {
        this.focusUsernameInput()
        this.setState({ errors: { ...this.state.errors, username: reason } })
        return reject(new Error('Invalid username: ' + reason))
      }

      console.log('...No new username validation errors')

      Meteor.call('AccountsHelp.userNameTaken', username, (err, response) => {
        if (err) {
          console.error(err)
          return reject(new Error('Sever error when checking userNameTaken: ' + err))
        }

        console.log('...No server error checking username ')

        const message = response ? `'${username}' is taken` : null
        this.setState({ errors: { ...this.state.errors, username: message } })
        if (message) {
          this.focusUsernameInput()
          return reject(new Error('Username is already taken.'))
        }

        console.log('...username is not taken, resolve()')

        resolve()
      })
    })
  }

  getButtonText = () => {
    const { email, username } = this.state

    // TODO only display email on enrollment success
    return email && username ? 'Enrolled: ' + email : 'Sign Up'
  }

  render() {
    const {
      email,
      errors,
      hasValidatedEmail,
      hasValidatedUsername,
      isRequestInProgress,
      showForm,
      username,
    } = this.state

    const errorStyle = {
      position: 'absolute',
      transition: 'opacity 0.2s',
      top: '100%',
      width: '100%',
      padding: '1em',
      color: '#fff',
      fontSize: '0.85em',
      textAlign: 'left',
      background: 'rgba(0, 0, 0, 0.85)',
      zIndex: '1000',
      pointerEvents: 'none',
    }

    if (!showForm) {
      return <Button size="small" primary content={this.getButtonText()} onClick={this.showForm} />
    }

    return (
      <div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Input
            id="mgb-hoc-save-my-work-username-input"
            disabled={isRequestInProgress}
            error={hasValidatedUsername && !!errors.username}
            size="small"
            onChange={this.handleUsernameChange}
            onKeyDown={this.handleUsernameKeyDown}
            placeholder="Username (for profile)"
            value={username}
          />
          <div style={{ ...errorStyle, opacity: hasValidatedUsername && errors.username ? 1 : 0 }}>
            <Icon name="warning sign" style={{ color: '#d53' }} /> {errors.username}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Input
            id="mgb-hoc-save-my-work-email-input"
            disabled={isRequestInProgress}
            error={hasValidatedEmail && !!errors.email}
            size="small"
            onChange={this.handleEmailChange}
            onKeyDown={this.handleEmailKeyDown}
            placeholder="you@example.com"
            value={email}
          />
          <div style={{ ...errorStyle, opacity: hasValidatedEmail && errors.email ? 1 : 0 }}>
            <Icon name="warning sign" style={{ color: '#d53' }} /> {errors.email}
          </div>
        </div>
        <Button
          content="Enroll"
          loading={isRequestInProgress}
          onClick={this.enroll}
          primary
          disabled={!email || !username || _.some(errors) || isRequestInProgress}
        />
      </div>
    )
  }
}

export default EnrollButton
