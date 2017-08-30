import React, { PropTypes } from 'react'
import { List, Image } from 'semantic-ui-react'

export default class BadgesItem extends React.Component {
  static propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    enabled: PropTypes.bool,
  }

  render() {
    return (
      <List.Item className={this.props.enabled ? '' : 'mgb-grayscale'}>
        <Image src={this.props.img} size="mini" />
        <b>{this.props.title}</b> - {this.props.description}
      </List.Item>
    )
  }
}
