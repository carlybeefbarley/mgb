import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

const HomeMeetFriendsColumnUI = (props) => (
  <Grid.Column className='animated fadeIn'>
    <Header as='h2' style={{ marginBottom: '1em' }}>Meet creative friends</Header>
    <List className="very relaxed">
      {
        props.loading === false && 
        props.userList.map( (person, idx) => (
          <List.Item key={idx} as={QLink} to={`/u/${person.username}`}>
            <Image avatar verticalAlign='middle' style={{ height: 60, width: 60 }} src={person.profile.avatar} />
            <div className="content middle aligned" style={{ marginLeft: '1em' }}>
              <Header as='h3' content={person.username} />
              <p><Icon name='trophy' />{person.badges ? person.badges.length : 0} badges</p>
            </div>
          </List.Item>
        ))
      }
    </List>
    <br />
    <QLink to={`/users`}>
      <Button color='teal' size='large' content='See more creators' />
    </QLink>
  </Grid.Column>
)
const HomeMeetFriendsColumn = createContainer ( 
  () => {
    const usersHandle = Meteor.subscribe("users.frontPageList")
    let findOpts = {
      sort:   userSorters["createdNewest"],
      limit:  3
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