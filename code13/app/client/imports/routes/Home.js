import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'
import PropTypes from 'prop-types'
import React from 'react'
import { Divider } from 'semantic-ui-react'

import HeroLayout from '/client/imports/layouts/HeroLayout'
import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'

import ExploreSegment from '/client/imports/components/Dashboard/Explore/ExploreSegment'

const HomeRoute = ({ currUser }) => {
  const username = currUser ? currUser.profile.name : 'guest'
  const userId = currUser ? currUser._id : null

  return (
    <HeroLayout
      heroContent={
        <div>
          <Divider hidden />

          <HomeHeroBanner username={username} userId={userId} />

          <Divider section />

          <ExploreSegment inverted />

          <Divider hidden section />
        </div>
      }
    />
  )
}

HomeRoute.propTypes = {
  currUser: PropTypes.object, // Can be null/undefined
}

export default HomeRoute
