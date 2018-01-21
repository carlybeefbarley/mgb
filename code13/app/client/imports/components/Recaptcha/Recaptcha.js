import _ from 'lodash'
import React, { Children, cloneElement, Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

const recaptchaProps = {
  className: 'g-recaptcha',
  'data-sitekey': '6LfASUEUAAAAAK1P5iKcak7LqxepMOzNw-AOHbcr',
  'data-callback': 'handleRecaptchaResponse',
}

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
      HTTP.call(
        'GET',
        `/api/validate-recaptcha/${encodeURIComponent(response)}`,
        (error, { data: isValid }) => {
          if (!isValid) return

          const { onComplete } = this.props

          delete window.handleRecaptchaResponse
          onComplete()
        },
      )
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

  renderInvisible = () => <Button {...recaptchaProps}>Submit</Button>

  renderInvisibleWithChild = () => cloneElement(Children.only(this.props.children), recaptchaProps)

  render() {
    const { children, invisible } = this.props
    const hasChildren = !_.isNil(children) && !_.isEmpty(children)

    if (!invisible) {
      return <div style={{ display: 'inline-block' }} {...recaptchaProps} />
    }

    return hasChildren ? this.renderInvisibleWithChild() : this.renderInvisible()
  }
}

export default Recaptcha
