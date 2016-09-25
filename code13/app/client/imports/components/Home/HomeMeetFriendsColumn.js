import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Image, Button } from 'stardust'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
}

const fakePeopleList = [ 
  { img: 'http://semantic-ui.com/images/avatar/small/helen.jpg', name: 'azurehaze', badges: 9 },
  { img: 'http://semantic-ui.com/images/avatar/small/daniel.jpg', name: 'azurehaze', badges: 7 },
  { img: 'http://semantic-ui.com/images/avatar/small/christian.jpg', name: 'azurehaze', badges: 6 }
]

const HomeMeetFriendsColumn = () => (
  <Grid.Column>
    <Header as='h2' style={{ marginBottom: '1em' }}>Meet creative friends</Header>
    <List className="very relaxed">
      {
        fakePeopleList.map( (person, idx) => (
          <List.Item key={idx}>
    
            <Image avatar verticalAlign='middle' style={{ height: 60, width: 60 }} src={person.img} />
            <div className="content middle aligned" style={{ marginLeft: '1em' }}>
              <Header as='h3' content={person.name} />
              <p><Icon name='trophy' />{person.badges} badges</p>
            </div>
          </List.Item>
        ))
      }
    </List>
    <br />
    <QLink to={`/users`}>
      <Button color='black' size='large' content='See more creators' />
    </QLink>
  </Grid.Column>
)

HomeMeetFriendsColumn.propTypes = _propTypes
export default HomeMeetFriendsColumn