import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { List } from 'semantic-ui-react'
import VideoItem from './VideoItem'

const _videoList = [
  {
    videoId: 'uzwmnpqt8AA',
    title: 'Graphic Editor Collaboration',
  },
  {
    videoId: 'u6QHlHHNbAc',
    title: 'Actor Editor Live Collaboration',
  },
  {
    videoId: 'ckUhs9RcQ0c',
    title: 'Code Editor Live Collaboration',
  },
  {
    videoId: 'o2hwsLFhDzY',
    title: 'Map Editor Live Collaboration',
  },
]

export default class VideoList extends React.Component {
  render() {
    return (
      <List>
        {_videoList.map(item => <VideoItem key={item.videoId} videoId={item.videoId} title={item.title} />)}
      </List>
    )
  }
}
