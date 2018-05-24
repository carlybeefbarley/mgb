import React from 'react'
import { Header } from 'semantic-ui-react'

const VideoFrame = props => (
  <div
    style={{
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: `${props.width}`,
      height: `${props.height}`,
      margin: '0 auto',
      ...props.style,
    }}
  >
    <iframe
      style={{ display: 'block', width: '100%', height: '100%' }}
      src={
        'https://www.youtube.com/embed/' + props.videoId + '?rel=0' + (props.hd ? '&vq=hd' + props.hd : '')
      }
      frameBorder="0"
      allowFullScreen
    />
    {props.title && <Header textAlign="center">{props.title}</Header>}
  </div>
)

export default VideoFrame
