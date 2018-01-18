import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

class Recaptcha extends Component {
  static propTypes = {
    onLoad: PropTypes.func,
    onComplete: PropTypes.func.isRequired,
    invisible: PropTypes.bool, // show invisible recaptcha
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
    if ('invisible' in this.props && this.props.invisible !== false) {
      if (this.props.children) {
        return React.cloneElement(this.props.children, {
          className: 'g-recaptcha',
          'data-sitekey': '6LdDrTkUAAAAABDXBxlLwWwTvnpmfH0s-4O5ckkm',
          'data-callback': 'handleRecaptchaResponse',
        })
      } else {
        return (
          <Button
            className="g-recaptcha"
            data-sitekey="6LdDrTkUAAAAABDXBxlLwWwTvnpmfH0s-4O5ckkm"
            data-callback="handleRecaptchaResponse"
          >
            Submit
          </Button>
        )
      }
    }
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
