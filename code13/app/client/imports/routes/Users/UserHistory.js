import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import NavRecentGET from '/client/imports/components/Nav/NavRecentGET.js'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'

export const UserHistoryRoute = ( { user } ) => (
  <div className="ui padded grid">
      <Helmet
        title={user.profile.name}
        meta={[ {"name": "description", "content": user.profile.name + "\'s history"} ]}
      />
      { user ? 
          <NavRecentGET styledForNavPanel={false} currUser={user}/>
        :
          <ThingNotFound type="User" />
      }
    </div>
)

UserHistoryRoute.propTypes = {
  query: PropTypes.object,
  user: PropTypes.object,
  currUser: PropTypes.object,
  ownsProfile: PropTypes.bool
}
export default UserHistoryRoute