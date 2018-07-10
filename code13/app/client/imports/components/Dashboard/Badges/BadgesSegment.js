import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Divider, Grid, Segment } from 'semantic-ui-react'

import BadgesList from '/client/imports/components/Badges/DashboardBadgeList'
import { getBadgesWithEnabledFlag } from '/imports/schemas/badges'

const BadgesSegment = ({ currUser }) => {
  const badges = getBadgesWithEnabledFlag(currUser.badges)
  const [enabledBadges, disabledBadges] = _.partition(badges, 'enabled')

  const disabledBadgeGroups = _.chain(disabledBadges)
    .filter(badge => !badge.hideBeforeEnabled)
    .groupBy('title')
    .values()
    .value()

  return (
    <div>
      <Segment>
        <BadgesList group={false} badges={enabledBadges} />

        <Divider horizontal section>
          Go for these badges next
        </Divider>
        <Grid columns="3" doubling stackable centered>
          {_.map(disabledBadgeGroups, badges => (
            <Grid.Column key={badges[0].name}>
              <BadgesList badges={badges} />
            </Grid.Column>
          ))}
        </Grid>
      </Segment>
    </div>
  )
}

BadgesSegment.propTypes = {
  currUser: PropTypes.object.isRequired,
}

export default BadgesSegment
