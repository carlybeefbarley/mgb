import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Header, Image, Message, Popup } from 'semantic-ui-react'

import { getFriendlyName } from '/imports/schemas/badges'

export default class BadgesList extends React.Component {
  static propTypes = {
    badges: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        title: PropTypes.string,
        img: PropTypes.string,
        descr: PropTypes.string,
        hideBeforeEnabled: PropTypes.bool,
      }),
    ),
    size: PropTypes.oneOf(['mini']),
  }

  static defaultProps = {
    group: true,
  }

  state = {}

  handleImageMouseEnter = badge => () => {
    this.setState({ activeBadge: badge })
  }

  handleImageMouseLeave = () => {
    this.setState({ activeBadge: null })
  }

  render() {
    const { activeBadge } = this.state
    const { badges, size, group } = this.props

    const isEnabled = _.every(badges, 'enabled')
    const sortedBadges = _.sortBy(badges, badge => badge.level * +isEnabled)

    const highestEarnedBadge = _.findLast(sortedBadges, 'enabled')
    const displayBadge = activeBadge || highestEarnedBadge || _.first(sortedBadges)

    const friendlyName = getFriendlyName(displayBadge)

    if (_.isEmpty(badges)) {
      return (
        <Message
          info
          size="large"
          icon="shield"
          header="No badges yet"
          content="Badges you earn show up here.  Get some fast by doing Tutorials."
        />
      )
    }

    if (size === 'mini') {
      return (
        <Card>
          <Card.Content>
            <Image src={displayBadge.img} size="mini" floated="left" />
            <Card.Header>
              {displayBadge.title}
              {friendlyName}
            </Card.Header>
            <Card.Meta>{displayBadge.descr}</Card.Meta>
          </Card.Content>
        </Card>
      )
    }

    const images = _.map(sortedBadges, (badge, i) => {
      const isActive = badge.name === _.get(activeBadge, 'name')
      const isGrayscale = group ? (activeBadge ? !isActive : !badge.enabled) : !(badge.enabled || isActive)

      const midPoint = (sortedBadges.length - 1) / 2

      const imageStyle = Object.assign(
        {
          transitionProperty: 'filter',
          transitionDuration: '0.2s',
          transitionTimingFunction: 'cubic-bezier(0.3, 1, 0.7, 1)',
          width: '64px',
          boxShadow: '0 4px 0 0 rgba(0, 0, 0, 0.1), inset 0 -1em rgba(0, 0, 0, 0.5)',
          margin: '0 1em 1em 0',
        },
        group && {
          transitionProperty: 'transform, filter',
          // 0.1s to prevent transform jitter
          transitionDelay: '0.1s, 0s',
          margin: 0,
          // marginRight: i !== badges.length - 1 ? '-2em' : '',
          transform: activeBadge
            ? ``
            : [
                `translate3d(${(midPoint - i) * 2}em, 0, 0)`,
                `scale(${(3 - (sortedBadges.length - (i + 1)) / sortedBadges.length) / 3})`,
              ].join(' '),
        },
      )

      const imageElement = (
        <Image
          key={badge.name}
          className={cx({ 'mgb-grayscale': isGrayscale })}
          src={badge.img}
          size="tiny"
          circular
          onMouseEnter={this.handleImageMouseEnter(badge)}
          onMouseLeave={this.handleImageMouseLeave}
          inline
          style={imageStyle}
        />
      )

      if (group) return imageElement

      return (
        <Popup
          key={badge.name}
          mouseEnterDelay={100}
          inverted
          size="tiny"
          position="top center"
          trigger={imageElement}
          header={getFriendlyName(badge)}
          content={badge.descr}
        />
      )
    })

    return (
      <div style={{ textAlign: group ? 'center' : '' }}>
        {images}
        {group && (
          <Header
            as="h4"
            content={friendlyName}
            subheader={group && !isEnabled && displayBadge.descr}
            style={{ margin: '0.5em' }}
          />
        )}
      </div>
    )
  }
}
