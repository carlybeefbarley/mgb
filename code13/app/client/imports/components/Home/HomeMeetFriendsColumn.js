import React, { PropTypes } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import UX from '/client/imports/UX'

import { Grid, Header, List, Icon, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

const HomeMeetFriendsColumnUI = ( { loading, userList }) => (
  <Grid.Column className='animated fadeIn'>
    <Header as='h2' style={{ marginBottom: '1em' }}>Meet creative friends</Header>
    <List relaxed='very'>
      {
        loading === false &&
        userList.map( (person, idx) => (
          <List.Item key={idx} as={QLink} to={`/u/${person.username}`}>
            <List.Content floated='left' style={{minWidth: '90px'}} >
              <UX.UserAvatarNoLink username={person.username} height='60px' />
            </List.Content>
            <List.Content verticalAlign='middle' style={{ marginLeft: '1em' }}>
              <Header as='h3' content={person.username} />
              <p><Icon color='yellow' name='trophy' />{person.badges ? person.badges.length : 0} badges</p>
            </List.Content>
          </List.Item>
        ))
      }
    </List>
    <br />
    <Button as={QLink} to={`/users`} fluid color='teal' size='large' content='See more creators' />
  </Grid.Column>
)
const HomeMeetFriendsColumn = createContainer (
  () => {
    const usersHandle = Meteor.subscribe("users.frontPageList")
    let findOpts = {
      sort:   userSorters["createdNewest"],
      limit:  4
    }
    let selector = {
      badges: {$exists: true},
      "badges.1":{$exists: true}
    }
    return {
      userList: Users.find(selector, findOpts).fetch(),
      loading: !usersHandle.ready()
    }
  },
  HomeMeetFriendsColumnUI)
export default HomeMeetFriendsColumn
