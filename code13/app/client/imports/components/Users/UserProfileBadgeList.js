import _ from 'lodash'
import React, { PropTypes } from 'react'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { getAllBadgesForUser } from '/imports/schemas/badges'

import { Segment, Header } from 'semantic-ui-react'

const UserProfileBadgeList = ( { user, className } ) => {
  if (!user) 
    return null
  
  const badgesPageUrl = `/u/${user.profile.name}/badges`
  const uBadges = getAllBadgesForUser(user)

  return (
    <div className={className}>
      <Header as='h2' id='#mgbjr-profile-badges-header'>
        <QLink to={badgesPageUrl}>Badges</QLink>
      </Header>
    
      <div id='#mgbjr-profile-badges-area'>
        { _.map(uBadges, b => <Badge name={b || '_blankBadge'} key={b}/>) }
        { (!uBadges || uBadges.length === 0) && <span>No badges yet...</span> }
      </div>
    </div>
  )
}

UserProfileBadgeList.propTypes = {
  user:      PropTypes.object,
  className: PropTypes.string
}

export default UserProfileBadgeList