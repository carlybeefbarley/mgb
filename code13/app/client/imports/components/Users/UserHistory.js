import React, { PropTypes } from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET'
import QLink from '/client/imports/routes/QLink'

const UserHistory = ( { user, width, borderless=false } ) => (
  <Grid.Column width={width} >
    {
      borderless ?
      <div id="mgbjr-user-profile-history">
        <Header as='h2'>
          <QLink to={`/u/${user.profile.name}/history`}>Activity</QLink>
        </Header>
        <div style={{maxHeight: '20em', overflowY: 'hidden'}}>
          <NavRecentGET
            styledForNavPanel={false}
            currUser={user}
            showUserActivities={true} />
        </div>
      </div>
      :
      <Segment id="mgbjr-user-profile-history">
        <Header as='h2'>
          <QLink to={`/u/${user.profile.name}/history`}>Recent Activity</QLink>
        </Header>
        <div style={{maxHeight: '20em', overflowY: 'auto'}}>
          <NavRecentGET
            styledForNavPanel={false}
            currUser={user}
            showUserActivities={true} />
        </div>
      </Segment>
    }
  </Grid.Column>
)

UserHistory.propTypes = {
  user:  PropTypes.object.isRequired,
  width: PropTypes.number.isRequired      // Width in SUI columns
}

export default UserHistory
