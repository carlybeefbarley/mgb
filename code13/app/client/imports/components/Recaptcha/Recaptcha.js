import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Recaptcha extends Component {
  static propTypes = {
    onLoad: PropTypes.func,
    onComplete: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { onLoad } = this.props

    if (onLoad) onLoad()

    window.handleRecaptchaLoad = () => {
      document.head.removeChild($script)
      delete window.handleRecaptchaLoad
    }

    window.handleRecaptchaResponse = response => {
      HTTP.call('GET', `/api/validate-recaptcha/${encodeURIComponent(response)}`, (error, isValid) => {
        if (!isValid) return

        const { onComplete } = this.props

        delete window.handleRecaptchaResponse
        onComplete()
      })
    }

    const $script = document.createElement('script')
    $script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=handleRecaptchaLoad')
    $script.setAttribute('async', true)
    $script.setAttribute('defer', true)
    document.head.appendChild($script)
  }

  componentWillUnmount() {
    delete window.handleRecaptchaResponse
  }

  render() {
    return (
      <div
        style={{ display: 'inline-block' }}
        className="g-recaptcha"
        data-sitekey="6LdDrTkUAAAAABDXBxlLwWwTvnpmfH0s-4O5ckkm"
        data-callback="handleRecaptchaResponse"
      />
    )
  }
}

export default Recaptcha
