import cx from 'classnames'
import React, { PropTypes } from 'react'
import { List, Image, Popup } from 'semantic-ui-react'

export default class BadgesItem extends React.Component {
  static propTypes = {
    badge: PropTypes.object,
    size: PropTypes.oneOf(['mini']),
  }

  render() {
    const { badge, size } = this.props

    const classes = cx({ 'mgb-grayscale': !badge.enabled })

    if (size === 'mini') {
      return (
        <List.Item className={classes}>
          <Image src={badge.img} size="mini" />
          <b>{badge.title}</b> - {badge.descr}
        </List.Item>
      )
    }

    return (
      <List.Item className={classes} style={{ width: '80px' }}>
        <Popup trigger={<Image src={badge.img} size="tiny" />}>
          <Popup.Header>{badge.title}</Popup.Header>
          <Popup.Content>{badge.description}</Popup.Content>
        </Popup>
      </List.Item>
    )
  }
}
