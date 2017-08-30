import React, { PropTypes } from 'react'
import { List, Image, Popup } from 'semantic-ui-react'

export default class BadgesItem extends React.Component {
  static propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    enabled: PropTypes.bool,
  }

  render() {
    return (
      <List.Item className={this.props.enabled ? '' : 'mgb-grayscale'} style={{ width: '80px' }}>
        <Popup trigger={<Image src={this.props.img} size="tiny" />}>
          <Popup.Header>{this.props.title}</Popup.Header>
          <Popup.Content>{this.props.description}</Popup.Content>
        </Popup>
      </List.Item>
    )
  }
}
