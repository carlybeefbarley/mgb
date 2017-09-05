import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Segment, List, Header, Modal, Popup } from 'semantic-ui-react'
import BadgesItem from '/client/imports/components/Badges/BadgesItem'
import { getBadgesWithEnabledFlag, selectBadges } from '/imports/schemas/badges'

export default class FaqSegment extends React.Component {
  static propTypes = {
    badgesArr: PropTypes.array,
    currUser: PropTypes.object,
  }

  state = {
    isCollapsed: false,
    isModal: false,
  }

  toggleModal = () => this.setState({ isModal: true })

  render() {
    const badgesArr = getBadgesWithEnabledFlag(this.props.currUser.badges)
    // reverse array because we want to get recent badges
    _.reverse(badgesArr)
    const enabledBadges = selectBadges(badgesArr, 3, true)
    // reverse again to get next disabled badges
    _.reverse(badgesArr)
    const disabledBadges = selectBadges(badgesArr, 6 - enabledBadges.length, false)
    const displayArr = _.concat(enabledBadges, disabledBadges)

    return (
      <Segment>
        <Header as="h3">Badges</Header>
        <div style={{ display: this.state.isCollapsed ? 'none' : 'block' }}>
          <List horizontal>
            {_.map(displayArr, badge => <BadgesItem key={badge.name} badge={badge} />)}
            <List.Item>
              <Popup
                trigger={
                  <Icon
                    name="ellipsis horizontal"
                    size="huge"
                    style={{ color: '#999' }}
                    onClick={this.toggleModal}
                  />
                }
              >
                <Popup.Content>See all badges</Popup.Content>
              </Popup>
            </List.Item>
          </List>
        </div>

        <Modal closeOnDimmerClick open={this.state.isModal} onClose={() => this.setState({ isModal: false })}>
          <Modal.Header>Your Badges</Modal.Header>
          <Modal.Content>
            <List>
              {_.map(badgesArr, badge => <BadgesItem size="mini" key={badge.name} badge={badge} />)}
            </List>
          </Modal.Content>
        </Modal>
      </Segment>
    )
  }
}
