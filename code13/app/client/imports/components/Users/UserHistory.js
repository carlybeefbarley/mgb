import React, { PropTypes } from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET'
import QLink from '/client/imports/routes/QLink'

const UserHistory = props => (
  <Grid.Column width={8}>
    <Segment>
    
      <Header as='h2'><QLink to={`/u/${props.user.profile.name}/history`}>History</QLink></Header>
      <NavRecentGET 
          styledForNavPanel={false} 
          currUser={props.user}
          showUserActivities={true} />
    </Segment>
  </Grid.Column>
)

UserHistory.propTypes = {
  user: PropTypes.object.isRequired
}

export default UserHistory