import PropTypes from 'prop-types'
import React from 'react'
import { Container, Header, Segment } from 'semantic-ui-react'
import Helmet from 'react-helmet'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import QLink from '/client/imports/routes/QLink'

export const UserHistoryRoute = ({ user }) => (
  <Container>
    <Segment padded basic>
      <Helmet
        title={user.profile.name}
        meta={[{ name: 'description', content: user.profile.name + "'s history" }]}
      />
      {user && (
        <Header as="h2">
          <QLink to={`/u/${user.profile.name}/history`}>Activity</QLink>
        </Header>
      )}
      {user ? (
        <Segment>
          <NavRecentGET styledForNavPanel={false} currUser={user} />
        </Segment>
      ) : (
        <ThingNotFound type="User" />
      )}
    </Segment>
  </Container>
)

UserHistoryRoute.propTypes = {
  user: PropTypes.object,
}
export default UserHistoryRoute
