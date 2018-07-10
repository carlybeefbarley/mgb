import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Segment, List, Modal } from 'semantic-ui-react'

// fake data here. Currently no XP point functionality implemented
export default class XpSegment extends React.Component {
  state = { isModal: false }

  toggleModal = () => this.setState({ isModal: true })

  render() {
    return (
      <Segment>
        <b style={{ fontSize: '35px' }}>15 LVL</b>
        <div
          style={{
            width: '200px',
            height: '15px',
            border: '1px solid #e5af00',
            display: 'inline-block',
            margin: '0 20px',
          }}
        >
          <span style={{ width: '75%', height: '100%', backgroundColor: '#f7c113', display: 'block' }} />
        </div>
        <b style={{ fontSize: '35px' }}>4500 XP</b>
        <span style={{ marginLeft: '20px' }}>350 points to go for next level</span>
        <Icon name="info" onClick={this.toggleModal} />

        <Modal closeOnDimmerClick open={this.state.isModal} onClose={() => this.setState({ isModal: false })}>
          <Modal.Header>How to earn XP</Modal.Header>
          <Modal.Content>
            <List>
              <List.Item>1 point for 1 minute drawing in graphic editor</List.Item>
              <List.Item>10 points for each new skill</List.Item>
              <List.Item>15 for checking and apporving task</List.Item>
              <List.Item>20 points for helping another user</List.Item>
              <List.Item>1 point for 1 minute drawing in graphic editor</List.Item>
              <List.Item>10 points for each new skill</List.Item>
              <List.Item>15 for checking and apporving task</List.Item>
              <List.Item>20 points for helping another user</List.Item>
              <List.Item>1 point for 1 minute drawing in graphic editor</List.Item>
              <List.Item>10 points for each new skill</List.Item>
              <List.Item>15 for checking and apporving task</List.Item>
              <List.Item>20 points for helping another user</List.Item>
              <List.Item>1 point for 1 minute drawing in graphic editor</List.Item>
              <List.Item>10 points for each new skill</List.Item>
              <List.Item>15 for checking and apporving task</List.Item>
              <List.Item>20 points for helping another user</List.Item>
            </List>
          </Modal.Content>
        </Modal>
      </Segment>
    )
  }
}
