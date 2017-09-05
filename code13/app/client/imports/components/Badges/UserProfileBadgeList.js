import _ from 'lodash'
import React, { PropTypes } from 'react'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import QLink from '/client/imports/routes/QLink'
import { getBadgesWithHighestLevel } from '/imports/schemas/badges'

import { Header } from 'semantic-ui-react'

const NoBadgesMsg = ({ ownsProfile }) => (
  <span>
    No badges yet.
    {ownsProfile && (
      <span>
        {' '}
        Earn your first badge by trying the <QLink to="/learn/getStarted">Get Started</QLink> tutorials!
      </span>
    )}
  </span>
)

const UserProfileBadgeList = ({ ownsProfile, user, className }) => {
  if (!user) return null

  const badgesPageUrl = `/u/${user.profile.name}/badges`
  const uBadges = getBadgesWithHighestLevel(user)

  return (
    <div className={className}>
      <Header as="h2" id="#mgbjr-profile-badges-header">
        <QLink to={badgesPageUrl}>Badges</QLink>
      </Header>

      <div id="#mgbjr-profile-badges-area">
        {_.map(uBadges, b => <Badge name={b || '_blankBadge'} key={b} />)}
        {(!uBadges || uBadges.length === 0) && <NoBadgesMsg ownsProfile={ownsProfile} />}
      </div>
    </div>
  )
}

UserProfileBadgeList.propTypes = {
  user: PropTypes.object,
  ownsProfile: PropTypes.bool,
  className: PropTypes.string,
}

export default UserProfileBadgeList
