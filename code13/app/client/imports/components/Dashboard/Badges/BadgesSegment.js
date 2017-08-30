import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Segment, List, Header, Modal, Popup } from 'semantic-ui-react'
import BadgesItem from './BadgesItem'
import BadgesItemMini from './BadgesItemMini'
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
    const enabledBadges = selectBadges(badgesArr, 3, true)
    const disabledBadges = selectBadges(badgesArr, 6 - enabledBadges.length, false)
    const displayArr = _.concat(enabledBadges, disabledBadges)

    return (
      <Segment>
        <Header as="h3">Badges</Header>
        <div style={{ display: this.state.isCollapsed ? 'none' : 'block' }}>
          <List horizontal>
            {displayArr.map((val, i) => (
              <BadgesItem
                key={i}
                img={val.img}
                title={val.title}
                description={val.description}
                enabled={val.enabled || false}
              />
            ))}
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
              {badgesArr.map((val, i) => (
                <BadgesItemMini
                  key={i}
                  img={val.img}
                  title={val.title}
                  description={val.description}
                  enabled={val.enabled || false}
                />
              ))}
            </List>
          </Modal.Content>
        </Modal>
      </Segment>
    )
  }
}
