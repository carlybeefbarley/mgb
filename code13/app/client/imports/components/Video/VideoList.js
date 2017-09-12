import _ from 'lodash'
import React, { PropTypes } from 'react'
import { List } from 'semantic-ui-react'
import VideoItem from './VideoItem'

const _videoList = [
  {
    url: 'uzwmnpqt8AA',
    title: 'Graphic Editor Collaboration',
  },
  {
    url: 'u6QHlHHNbAc',
    title: 'Actor Editor Live Collaboration',
  },
  {
    url: 'ckUhs9RcQ0c',
    title: 'Code Editor Live Collaboration',
  },
  {
    url: 'o2hwsLFhDzY',
    title: 'Map Editor Live Collaboration',
  },
]

export default class VideoList extends React.Component {
  render() {
    return (
      <List>{_videoList.map(item => <VideoItem key={item.url} url={item.url} title={item.title} />)}</List>
    )
  }
}
