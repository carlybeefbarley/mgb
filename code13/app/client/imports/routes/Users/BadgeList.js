import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import Badge, { getAllBadgesForUser } from '/client/imports/components/Controls/Badge/Badge'
import { Segment } from 'stardust'

const BadgeListRoute = props => {
  const { user } = props
  if (!user) return null

  const badgesForUser = getAllBadgesForUser(user)
  const makeBadgeFromVal = val => (<Badge name={val} key={val} />)

  return (
    <Segment basic>

      <Helmet
        title={`${user.profile.name} Badge List`}
        meta={[
            {"name": "description", "content": "Badges"}
        ]}
      />
      
      <div className="ui padded images">
        { badgesForUser.map(val => makeBadgeFromVal(val) ) } 
      </div>

    </Segment>
  )
}

BadgeListRoute.propTypes = {
  user: PropTypes.object
}

export default BadgeListRoute