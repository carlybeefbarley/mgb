import React, { PropTypes } from 'react'
import { Segment, Container } from 'semantic-ui-react'
import Helmet from 'react-helmet'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET.js'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

export const UserHistoryRoute = ( { user } ) => (
  <Container>
    <Segment>
      <Helmet
        title={user.profile.name}
        meta={[ {"name": "description", "content": user.profile.name + "\'s history"} ]}
      />
      { user ? 
          <NavRecentGET styledForNavPanel={false} currUser={user}/>
        :
          <ThingNotFound type="User" />
      }
    </Segment>
  </Container>
)

UserHistoryRoute.propTypes = {
  user: PropTypes.object
}
export default UserHistoryRoute