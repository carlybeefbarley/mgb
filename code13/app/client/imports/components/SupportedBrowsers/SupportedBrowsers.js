import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Icon, Segment } from 'semantic-ui-react'

class SupportedBrowsers extends Component {
  static propTypes = {
    /** The download buttons to offer the user. */
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        href: PropTypes.string.isRequired,
        recommended: PropTypes.bool,
      }),
    ).isRequired,
  }

  renderDownloadButton = ({ icon, content, href }, recommended) => (
    <Button
      key={content}
      as="a"
      href={href}
      target="_blank"
      rel="noreferrer nofollow"
      basic={recommended}
      color={recommended ? null : 'red'}
      inverted={recommended}
      compact
      size="tiny"
      icon={icon}
      content={content}
    />
  )

  render() {
    const { buttons } = this.props

    return (
      <Segment inverted color="red" textAlign="center" style={{ margin: 0 }}>
        <p>
          <Icon name="warning sign" inverted />
          Your browser doesn't support newer features we use, please upgrade:
        </p>
        {buttons.reduce((acc, next, i) => {
          const { recommended, ...props } = next
          const button = this.renderDownloadButton(props, recommended)
          const divider = <span key={i}>&emsp;</span>

          return acc === null ? [button] : [...acc, divider, button]
        }, null)}
      </Segment>
    )
  }
}

export default SupportedBrowsers
