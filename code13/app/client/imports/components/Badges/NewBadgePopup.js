import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Button } from 'semantic-ui-react'

// TODO I want to open badge similar to showToast() function where is no state involved
// The event comes from server and shows simple badge award popup which can be closed

export class NewBadgePopup extends React.Component {
  static propTypes = {
    badge: PropTypes.object,
  }

  render() {
    const badge = this.props.badge
    console.log(badge)

    return (
      <Modal size="small" open>
        <Modal.Header>{badge.title}</Modal.Header>
        <Modal.Content>
          <p>{badge.decription}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon="checkmark" labelPosition="right" content="Continue" />
        </Modal.Actions>
      </Modal>
    )
  }
}

export const showBadgePoup = badge => {
  return <NewBadgePopup badge={badge} />
}
