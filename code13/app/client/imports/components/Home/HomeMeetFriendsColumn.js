import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Image, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
}

const fakePeopleList = [ 
  { img: '/api/asset/png/kvBq9PB987zuKiENQ', name: 'dgolds', badges: 9 },
  { img: 'http://www.gravatar.com/avatar/747ac1809af200d4f8403cfe6a240c9e?s=50&d=mm', name: 'DaPerson', badges: 3 },
  { img: 'http://semantic-ui.com/images/avatar/small/christian.jpg', name: 'Micah', badges: 6 }
]

const HomeMeetFriendsColumn = () => (
  <Grid.Column className='animated fadeIn'>
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