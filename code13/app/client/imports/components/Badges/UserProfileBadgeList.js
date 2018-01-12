import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Badge from '/client/imports/components/Badges/Badge'
import QLink from '/client/imports/routes/QLink'
import { getBadgesWithHighestLevel } from '/imports/schemas/badges'

import { Header, Segment, Grid } from 'semantic-ui-react'

const NoBadgesMsg = ({ ownsProfile }) => (
  <span>
    No badges yet.
    {ownsProfile && (
      <span>
        {' '}
        Earn your first badge by trying the <QLink to="/learn/get-started">Get Started</QLink> tutorials!
      </span>
    )}
  </span>
)

const UserProfileBadgeList = ({ ownsProfile, user }) => {
  if (!user) return null

  const badgesPageUrl = `/u/${user.profile.name}/badges`
  const uBadges = getBadgesWithHighestLevel(user)

  return (
    <Grid.Column width={16}>
      <Segment raised color="blue">

        <div id="#mgbjr-profile-badges-area">

          {_.map(uBadges, b => <Badge name={b || '_blankBadge'} key={b} />)}
          {(!uBadges || uBadges.length === 0) && <NoBadgesMsg ownsProfile={ownsProfile} />}

        </div>
      </Segment>
    </Grid.Column>
  )
}

UserProfileBadgeList.propTypes = {
  user: PropTypes.object,
  ownsProfile: PropTypes.bool,
  className: PropTypes.string,
}

export default UserProfileBadgeList
