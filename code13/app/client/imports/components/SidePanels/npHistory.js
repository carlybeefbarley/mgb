import React, { PropTypes } from 'react'
import NavRecentGET from '../Nav/NavRecentGET'

const npHistory = ( { currUser } ) => (
  <NavRecentGET styledForNavPanel={true} currUser={currUser} />
)

npHistory.propTypes = {
  currUser:           PropTypes.object             // Currently Logged in user. Can be null/undefined
}

export default npHistory