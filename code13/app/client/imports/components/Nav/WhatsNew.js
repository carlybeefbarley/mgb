import _ from 'lodash'
import React, { PropTypes } from 'react'

import mgbReleaseInfo from '/imports/mgbReleaseInfo'
import QLink from '/client/imports/routes/QLink'
import { Label, Icon, Image } from 'semantic-ui-react'

class WhatsNew extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
  }

  state = { hovering: false }

  handleMouseEnter = () => this.setState(() => ({ hovering: true }))

  handleMouseLeave = () => this.setState(() => ({ hovering: false }))

  render() {
    const { currUser } = this.props
    const { hovering } = this.state
    const hasNewNews =
      currUser && _.get(currUser, 'profile.latestNewsTimestampSeen') !== mgbReleaseInfo.releases[0].timestamp

    if (!hasNewNews) return null

    const transformContainerStyle = {
      overflow: 'hidden',
      position: 'absolute',
      marginTop: '-1rem',
      bottom: '0',
      top: '0',
      pointerEvents: 'none',
    }

    const transformItemStyle = {
      willChange: 'opacity transform',
      transition: 'opacity 0.35s, transform 0.35s',
      transitionTimingFunction: 'cubic-bezier(0.3, 1, 0.7, 1)',
    }

    const imageStyle = {
      ...transformItemStyle,
      width: '4rem',
      verticalAlign: 'top',
      transform: `translate3d(0, ${hovering ? 0 : 25}%, 0)`,
    }

    const labelStyle = {
      ...transformItemStyle,
      marginTop: '1rem',
      opacity: hovering ? 1 : 0,
      transform: `translate3d(0, ${hovering ? 25 : 50}%, 0)`,
    }

    return (
      <span>
        <span style={transformContainerStyle}>
          <QLink to="/whats-new" style={{ pointerEvents: 'all' }}>
            <Image
              inline
              src="/images/mascots/penguin.png"
              style={imageStyle}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
            />
          </QLink>
          <Label
            basic
            horizontal
            icon="gift"
            color="purple"
            pointing="left"
            content="New stuff for you!"
            size="small"
            style={labelStyle}
          />
        </span>
      </span>
    )
  }
}

export default WhatsNew
