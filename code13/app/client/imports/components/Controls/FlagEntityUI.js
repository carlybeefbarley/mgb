import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Popup, Button, Dropdown, Label, Divider, TextArea } from 'semantic-ui-react'
import { FlagTypes, _parseTableNameToTable } from '/imports/schemas/flags'
import _ from 'lodash'
import { showToast } from '/client/imports/modules'

class FlagEntity extends React.Component {
  state = {
    userSelectedTags: [],
    userComments: '',
  }

  static propTypes = {
    tableCollection: PropTypes.string.isRequired,
    entity: PropTypes.object.isRequired,
    currUser: PropTypes.object,
  }
  render() {
    const { currUser, tableCollection, entity } = this.props
    const entityInfo = _parseTableNameToTable(tableCollection)
    const entityOwnerId = entity[entityInfo.ownerIdKey]
    return (
      currUser &&
      !entity.suFlagId &&
      !(entity.suIsBanned === true) &&
      currUser._id !== entityOwnerId && (
        <span className={tableCollection === 'Chats' ? 'mgb-show-on-parent-hover' : null}>
          <Popup
            on="click"
            size="tiny"
            wide="very"
            position="bottom right"
            trigger={
              <Label
                circular
                basic
                size="mini"
                icon={{ name: 'warning', color: 'red', style: { marginRight: 0 } }}
              />
            }
          >
            <Popup.Header
              style={{ paddingLeft: '3%', paddingTop: '2%', paddingBottom: '4%', fontSize: '1.5em' }}
            >
              Report this {tableCollection === 'Azzets' ? 'Asset' : 'Message'} to Moderator
            </Popup.Header>
            <Popup.Content>
              <Segment basic style={{ minWidth: '30em' }}>
                <Dropdown
                  placeholder="Reason(s)"
                  search
                  compact
                  fluid
                  multiple
                  selection
                  options={_.map(_.keys(FlagTypes), k => ({
                    text: FlagTypes[k].displayName,
                    value: k,
                  }))}
                  onChange={(event, data) => {
                    console.log('Change Happened')
                    this.setState({ userSelectedTags: data.value })
                  }}
                />
                <Divider hidden />
                <TextArea
                  style={{ width: '100%' }}
                  placeholder="Additional comments/concerns"
                  autoHeight
                  onChange={(event, textarea) => {
                    this.setState({ userComments: textarea.value })
                  }}
                />
                <Divider hidden />
                <Button
                  style={{ marginBottom: '2%' }}
                  as="div"
                  floated="right"
                  onClick={() =>
                    _doReportEntity(
                      currUser,
                      entity,
                      tableCollection,
                      this.state.userSelectedTags,
                      this.state.userComments,
                    )}
                  size="large"
                  content="Report"
                  icon="warning sign"
                  color="red"
                />
                &nbsp;
              </Segment>
            </Popup.Content>
          </Popup>
        </span>
      )
    )
  }
}

const _doReportEntity = (currUser, entity, tableCollection, selectedTags, userComments) => {
  let reportedEntity = {}
  let data = {}
  if (!entity.suFlagId && currUser) {
    if (tableCollection === 'Chats') {
      reportedEntity = {
        table: 'Chats',
        recordId: entity._id,
      }
      data = {
        flagTypes: selectedTags,
        comments: userComments,
      }
    } else if (tableCollection === 'Azzets') {
      reportedEntity = {
        table: 'Azzets',
        recordId: entity._id,
      }
      data = {
        flagTypes: selectedTags,
        comments: userComments,
      }
    }
  }
  Meteor.call('Flags.create', reportedEntity, data, (error, result) => {
    if (error) showToast.error(`Could not flag: ${error.reason}`)
    else showToast.success('Flagged successfully')
  })
}
export default FlagEntity
