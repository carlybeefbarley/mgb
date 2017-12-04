import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Icon, Popup } from 'semantic-ui-react'
import VideoFrame from './VideoFrame'

export default class VideoPopup extends React.Component {
  static propTypes = {
    videoId: PropTypes.string,
  }

  render() {
    const { videoId } = this.props

    return (
      <Modal
        closeOnDimmerClick
        closeIcon
        style={{ background: 'rgba(0,0,0,0)' }}
        trigger={
          <Popup
            trigger={
              <Icon
                name="video"
                color="purple"
                size="large"
                style={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  position: 'fixed',
                  right: '10px',
                  bottom: '10px',
                }}
                inverted
                circular
              />
            }
            content="Need help? Click to watch a video tutorial."
            position="top left"
          />
        }
      >
        <VideoFrame videoId={videoId} hd="1080" width="854px" height="480px" />
      </Modal>
    )
  }
}
