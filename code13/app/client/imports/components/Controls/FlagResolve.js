import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Button, Form, Label, Divider } from 'semantic-ui-react'
import { Flags } from '/imports/schemas'
import { FlagTypes } from '/imports/schemas/flags'
import _ from 'lodash'
import { showToast } from '/client/imports/modules'

class ResolveReportEntity extends React.Component {
  state = {
    modComments: '',
  }

  render() {
    const { currUser, entity, isSuperAdmin, className, tableCollection } = this.props

    return isSuperAdmin && currUser && entity.suFlagId ? (
      <span className={className}>
        <Popup
          on="click"
          size="tiny"
          position="left center"
          trigger={
            <Label
              circular
              basic
              size="mini"
              icon={{ name: 'help circle', color: 'blue', style: { marginRight: 0 } }}
            />
          }
          wide="very"
        >
          <Popup.Header>Resolve this flag</Popup.Header>
          <Popup.Content>
            <Form style={{ minWidth: '25em' }}>
              <Divider hidden />
              Comments on the situation/why are you banning this or not?
              <Form.TextArea
                autoHeight
                placeholder="Moderator comments"
                onChange={(event, textarea) => {
                  this.setState({ modComments: textarea.value })
                }}
              />
              <Divider hidden />
              Ban this permanently?
              <br />
              <em>(the {tableCollection} will show up as deleted by moderator)</em>
              <Divider hidden />
              <Button.Group>
                <Button
                  value
                  onClick={() =>
                    _doResolveReportEntity(entity._id, true, this.state.modComments, tableCollection)}
                  negative
                >
                  Yes Ban
                </Button>
                <Button.Or />
                <Button
                  value={false}
                  onClick={() =>
                    _doResolveReportEntity(entity._id, false, this.state.modComments, tableCollection)}
                  positive
                >
                  Don't Ban
                </Button>
              </Button.Group>
              &nbsp;
            </Form>
          </Popup.Content>
        </Popup>
      </span>
    ) : null
  }
}

ResolveReportEntity.propTypes = {
  tableCollection: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
  currUser: PropTypes.object.isRequired,
  isSuperAdmin: PropTypes.bool,
  className: PropTypes.string,
}

const _doResolveReportEntity = (entityId, wasPermBanned, comments, tableCollection) => {
  var reportedEntity = {}
  var data = {}
  if (tableCollection === 'Chats') {
    reportedEntity = {
      table: 'Chats',
      recordId: entityId,
    }
    data = {
      wasPermBanned,
      comments,
    }
  } else if (tableCollection === 'Azzets') {
    reportedEntity = {
      table: 'Azzets',
      recordId: entityId,
    }
    data = {
      wasPermBanned,
      comments,
    }
  }
  Meteor.call('Flags.resolve', reportedEntity, data, (error, result) => {
    if (error) showToast.error(`Could not resolve flag: ${error.reason}`)
    else console.log('Flags.resolve said ok')
    // else say ok?
  })
}
export default ResolveReportEntity
