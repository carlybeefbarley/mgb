import _ from 'lodash'
import React, { PropTypes } from 'react'

import mgbReleaseInfo from '/imports/mgbReleaseInfo'
import QLink from '/client/imports/routes/QLink'
import { Label, Icon, Image } from 'semantic-ui-react'

class WhatsNew extends React.Component {
  state = { hovering: false }

  handleMouseEnter = () => this.setState(() => ({ hovering: true }))

  handleMouseLeave = () => this.setState(() => ({ hovering: false }))

  render() {
    const { currUser, asHidingLink } = this.props
    const { hovering } = this.state
    const color = 'purple'
    const icon = 'gift'
    const hasNewNews =
      currUser && _.get(currUser, 'profile.latestNewsTimestampSeen') !== mgbReleaseInfo.releases[0].timestamp

    if (!asHidingLink) return <Icon name={icon} color={hasNewNews ? color : null} />

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
          <QLink to="/whatsnew" style={{ pointerEvents: 'all' }}>
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
            icon={icon}
            color={color}
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

WhatsNew.propTypes = {
  currUser: PropTypes.object, // Can be null (if user is not logged in)
  asHidingLink: PropTypes.bool, // If true then render as null or <Qlink> depending on last seen
}

export default WhatsNew
