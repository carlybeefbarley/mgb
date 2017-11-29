import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Button } from 'semantic-ui-react'
import VideoFrame from './VideoFrame'

export default class VideoPopup extends React.Component {
  static propTypes = {
    videoId: PropTypes.string,
  }

  render() {
    return (
      <Modal
        open={this.state.showVideoModal}
        closeOnDimmerClick
        closeIcon
        style={{ background: 'rgba(0,0,0,0)' }}
        onClose={this.handleCloseVideoModal}
      >
        <VideoFrame videoId={currStep.videoId} hd="1080" width="854px" height="480px" />
      </Modal>
    )
  }
}
