import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { List, Segment, Header } from 'semantic-ui-react'

export default class VideoItem extends React.Component {
  static propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    return (
      <List.Item>
        <Segment>
          <iframe
            style={{ display: 'block', margin: '0 auto' }}
            width="560"
            height="315"
            src={'https://www.youtube.com/embed/' + this.props.url}
            frameBorder="0"
            allowFullScreen
          />
          <Header textAlign="center">{this.props.title}</Header>
        </Segment>
      </List.Item>
    )
  }
}
