import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { List, Segment } from 'semantic-ui-react'
import VideoFrame from './VideoFrame'

export default class VideoItem extends React.Component {
  static propTypes = {
    videoId: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    const { videoId, title } = this.props

    return (
      <List.Item>
        <Segment style={{ paddingBottom: '3em' }}>
          <VideoFrame videoId={videoId} title={title} hd="1080" width="560px" height="315px" />
        </Segment>
      </List.Item>
    )
  }
}
