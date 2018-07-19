import React from 'react'
import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'
import UX from '/client/imports/UX'

import { Grid, Header, List, Icon, Button, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { withTracker } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

const segmentStyle = {
  display: 'flex',
  flexDirection: 'column',
}

const listStyle = {
  flex: '1',
}

const HomeMeetFriendsColumnUI = ({ loading, userList }) => (
  <Grid.Column className="animated fadeIn">
    <Segment raised style={segmentStyle}>
      <Header as="h2" textAlign="center">
        Meet creative friends
      </Header>
      <List relaxed="very" selection style={listStyle}>
        {loading === false &&
          userList.map((person, idx) => (
            <List.Item key={idx} as={QLink} to={`/u/${person.username}`}>
              <List.Content floated="left" style={{ minWidth: '90px' }}>
                <UX.UserAvatarNoLink username={person.username} height="60px" />
              </List.Content>
              <List.Content verticalAlign="middle" style={{ marginLeft: '1em' }}>
                <Header as="h3" content={person.username} />
                <p>
                  <Icon color="yellow" name="trophy" />
                  {person.badges ? person.badges.length : 0} badges
                </p>
              </List.Content>
            </List.Item>
          ))}
      </List>
      <br />
      <Button as={QLink} to={`/users`} fluid primary size="large" content="See more creators" />
    </Segment>
  </Grid.Column>
)
const HomeMeetFriendsColumn = withTracker(() => {
  const usersHandle = Meteor.subscribe('users.frontPageList')
  let findOpts = {
    sort: userSorters['createdNewest'],
    limit: 4,
  }
  let selector = {
    badges: { $exists: true },
    'badges.1': { $exists: true },
  }
  return {
    userList: Users.find(selector, findOpts).fetch(),
    loading: !usersHandle.ready(),
  }
})(HomeMeetFriendsColumnUI)
export default HomeMeetFriendsColumn
