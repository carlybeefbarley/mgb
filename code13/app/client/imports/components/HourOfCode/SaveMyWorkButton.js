import _ from 'lodash'
import React, { Component } from 'react'

import { Icon, Input, Button } from 'semantic-ui-react'

import validate from '/imports/schemas/validate'
import Hotjar from '/client/imports/helpers/hotjar'

class SaveMyWorkButton extends Component {
  state = {
    showInput: false,
    email: '',
    error: null,
    hasSaved: false,
  }

  componentDidUpdate(prevProps, prevState) {
    const hasVisibleError = this.state.hasSaved && !!this.state.error
    const prevHasVisibleError = prevState.hasSaved && !!prevState.error

    // Popup error hack
    // Controlled popup does not calculate position on first render, force a render after it opens
    if (hasVisibleError !== !prevHasVisibleError) {
      setTimeout(() => this.forceUpdate)
    }
  }

  handleEmailChange = e => {
    const email = e.target.value
    const error = validate.emailWithReason(email)

    return this.setState({ email, error, hasSaved: false })
  }

  handleEmailKeyDown = e => e.keyCode === 13 && this.saveEmail()

  showInput = () => {
    Hotjar('vpv', 'hour-of-code/save-my-work:start')
    this.setState({ email: this.getHoCEmail() || '', showInput: true }, this.focusInput)
  }

  hideInput = () => this.setState({ showInput: false })

  focusInput = () => {
    // wait for Popup to mount the Input `trigger`
    setTimeout(() => {
      const $input = document.querySelector('#mgb-hoc-save-my-work-email-input')

      if ($input) {
        $input.focus()
        if ($input.value) $input.select()
      }
    })
  }

  saveEmail = () => {
    this.setState({ isSaving: true, hasSaved: true })
    const { email } = this.state

    Hotjar('vpv', 'hour-of-code/save-my-work:submit')

    // don't clear existing error
    if (this.state.error) {
      this.setState({ isSaving: false })
      this.focusInput()
      return
    }

    const error = validate.emailWithReason(email)
    if (error) {
      this.focusInput()
      this.setState({ error, isSaving: false })
      return
    }

    Meteor.call('AccountsHelp.emailTaken', email, (err, response) => {
      if (err) return console.error(err)

      const message = response ? `'${email}' is taken` : null
      this.setState({ error: message })
      if (message) {
        this.setState({ isSaving: false })
        this.focusInput()
        return
      }

      Hotjar('vpv', 'hour-of-code/save-my-work:validated')

      Meteor.call('User.updateProfile', Meteor.user()._id, { 'profile.HoC.email': email }, error => {
        const { profile: { name } } = Meteor.user()
        this.setState({ isSaving: false })
        if (error) {
          console.error(`Hour of Code: failed to save email ${email} for HoC user ${name}:`, error.reason)
          alert(
            [
              "Uh oh! We can't save your work right now.",
              `Email your username "${name}" to "hello@mygamebuilder.com" and we'll fix it.`,
            ].join('\n\n'),
          )
          return
        }

        Hotjar('vpv', 'hour-of-code/save-my-work:success')

        this.hideInput()
      })
    })
  }

  getHoCEmail = () => _.get(Meteor.user(), 'profile.HoC.email')

  render() {
    const { email, error, hasSaved, isSaving, showInput } = this.state

    const hasVisibleError = hasSaved && !!error

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {showInput ? (
          <Input
            id="mgb-hoc-save-my-work-email-input"
            error={hasVisibleError}
            size="small"
            onChange={this.handleEmailChange}
            onKeyDown={this.handleEmailKeyDown}
            placeholder="you@example.com"
            value={email}
            action={{
              content: 'Save',
              loading: isSaving,
              onClick: this.saveEmail,
              primary: true,
              disabled: !email || hasVisibleError || isSaving,
            }}
          />
        ) : (
          <Button
            size="small"
            primary
            content={this.getHoCEmail() || 'Save my work'}
            onClick={this.showInput}
          />
        )}
        <div
          style={{
            position: 'absolute',
            transition: 'opacity 0.2s',
            top: '100%',
            width: '100%',
            padding: '1em',
            color: '#fff',
            fontSize: '0.85em',
            textAlign: 'left',
            background: 'rgba(0, 0, 0, 0.85)',
            opacity: +hasVisibleError,
            zIndex: '1000',
            pointerEvents: 'none',
          }}
        >
          <Icon name="warning sign" style={{ color: '#d53' }} /> {error}
        </div>
      </div>
    )
  }
}

export default SaveMyWorkButton
