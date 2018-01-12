import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Header, Segment } from 'semantic-ui-react'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET'
import QLink from '/client/imports/routes/QLink'

const UserHistory = ({ user, width }) => (
  <Grid.Column width={width}>
    <Segment id="mgbjr-user-profile-history" raised color="blue">
      <Header as="h2">
        <QLink to={`/u/${user.profile.name}/history`}>Activity</QLink>
      </Header>
      <div style={{ maxHeight: '20em', overflowY: 'auto' }}>
        <NavRecentGET styledForNavPanel={false} currUser={user} showUserActivities />
      </div>
    </Segment>
  </Grid.Column>
)

UserHistory.propTypes = {
  user: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired, // Width in SUI columns
}

export default UserHistory
