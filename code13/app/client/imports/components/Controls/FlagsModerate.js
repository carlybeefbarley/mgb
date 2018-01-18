import PropTypes from 'prop-types'
import React from 'react'
import { Header, List, Segment } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'
import { Flags } from '/imports/schemas'
import UX from '/client/imports/UX'

const FlagsModerateUI = ({ loading, flagsList }) => (
  <div>
    <Header sub> Needs Moderation</Header>
    {loading === false &&
      flagsList.map((flag, idx) => (
        <Segment key={idx}>
          <List>
            <List.Item>
              <UX.LinkToFlaggedEntity
                entityType={flag.entityType}
                ownerUsername={flag.ownerUserName}
                entityId={flag.entityId}
              />
            </List.Item>
            <List.Item>
              <List.Icon name="clock" />
              <List.Content>
                Created: <UX.TimeAgo when={flag.createdAt} />
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="user" />
              <List.Content>
                Flagged User: <UX.UserLink username={flag.ownerUserName} />
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Icon name="warning sign" />
              <List.Content>
                Flagged by: <UX.UserLink username={flag.reporterUserName} />
              </List.Content>
            </List.Item>
            <List.Item>Type of entity: {flag.entityType}</List.Item>
            <List.Item>
              <List.Content>
                <List.Icon name="list layout" />
                &ensp; List of flag types
              </List.Content>
              <List bulleted>
                {flag.flagTypes && flag.flagTypes.map((type, idx) => <List.Item key={idx}>{type}</List.Item>)}
              </List>
            </List.Item>
            <List.Item>
              <List.Content>Reporter comments: "{flag.reporterComments}"</List.Content>
            </List.Item>
          </List>
        </Segment>
      ))}
  </div>
)

const FlagsModerate = createContainer(() => {
  const flagsHandle = Meteor.subscribe('flagged.recent.unresolved', {})

  return {
    flagsList: Flags.find().fetch(),
    loading: !flagsHandle.ready(),
  }
}, FlagsModerateUI)
export default FlagsModerate
