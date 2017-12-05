import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Icon, Popup } from 'semantic-ui-react'
import VideoFrame from './VideoFrame'

export default class VideoPopup extends React.Component {
  static propTypes = {
    videoId: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      showModal: false,
      hidden: false,
    }
  }

  handleModalOpen = () => {
    this.setState({ showModal: true })
  }

  handleModalClose = () => {
    this.setState({ showModal: false })
  }

  handleHidePopup = () => {
    this.setState({ hidden: true, showModal: false })
  }

  render() {
    const { videoId } = this.props

    return (
      <div>
        <Modal
          closeOnDimmerClick
          closeIcon
          open={this.state.showModal}
          onClose={this.handleModalClose}
          style={{ background: 'rgba(0,0,0,0)' }}
        >
          <VideoFrame videoId={videoId} hd="1080" width="854px" height="480px" />
        </Modal>
        {!this.state.hidden && (
          <Popup
            hoverable
            trigger={
              <Icon
                inverted
                circular
                name="video"
                color="purple"
                size="large"
                onClick={this.handleModalOpen}
                style={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  position: 'fixed',
                  right: '10px',
                  bottom: '10px',
                }}
              />
            }
            position="top left"
          >
            Need help? Click to watch a video tutorial.
            <Icon
              name="close"
              color="red"
              title="hide button"
              corner
              link
              style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={this.handleHidePopup}
            />
          </Popup>
        )}
      </div>
    )
  }
}
