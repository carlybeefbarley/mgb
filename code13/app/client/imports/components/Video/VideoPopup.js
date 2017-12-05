import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Icon, Popup, List } from 'semantic-ui-react'
import VideoFrame from './VideoFrame'
import { withStores } from '/client/imports/hocs'
import { videoStore } from '/client/imports/stores'

class VideoPopup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedVideoId: null,
      showModal: false,
      hidden: false,
    }
  }

  handleSelectVideo = selectedVideoId => {
    this.setState({ showModal: true, selectedVideoId })
  }

  handleModalClose = () => {
    this.setState({ selectedVideoId: null, showModal: false })
  }

  handleHidePopup = () => {
    this.setState({ hidden: true })
  }

  renderVideoList() {
    const { videoStore: { state: { videos } } } = this.props
    return (
      <List divided selection>
        {_.map(videos, video => {
          return (
            <List.Item
              key={video.videoId}
              as="a"
              onClick={() => {
                this.handleSelectVideo(video.videoId)
              }}
            >
              <List.Header>{video.header}</List.Header>
            </List.Item>
          )
        })}
      </List>
    )
  }

  render() {
    return (
      <div>
        {this.state.selectedVideoId && (
          <Modal
            closeOnDimmerClick
            closeIcon
            open={this.state.showModal}
            onClose={this.handleModalClose}
            style={{ background: 'rgba(0,0,0,0)' }}
          >
            <VideoFrame videoId={this.state.selectedVideoId} hd="1080" width="854px" height="480px" />
          </Modal>
        )}
        {!this.state.hidden && (
          <Popup
            hoverable
            on="hover"
            trigger={
              <Icon
                inverted
                circular
                title="Need help? Click to watch a video tutorial."
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
              />
            }
            position="top left"
          >
            <div>
              <Icon
                name="close"
                color="red"
                title="hide button"
                corner
                link
                style={{ position: 'absolute', top: 0, right: 0 }}
                onClick={this.handleHidePopup}
              />
              {this.renderVideoList()}
            </div>
          </Popup>
        )}
      </div>
    )
  }
}

export default withStores({ videoStore })(VideoPopup)
