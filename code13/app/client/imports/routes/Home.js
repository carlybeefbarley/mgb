import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'
import React, { PropTypes } from 'react'
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
HomeRoute.responsiveRules = {
  // Note that this could also be a function that returns this kind of object
  noColumns: {
    minWidth: 0,
    maxWidth: 250,
    respData: { columns: -1 },
  },
  oneColumn: {
    minWidth: 251,
    maxWidth: 650,
    respData: { columns: 1 },
  },
  TwoColumn: {
    minWidth: 651,
    maxWidth: 850,
    respData: { columns: 2 },
  },
  ThreeColumn: {
    minWidth: 851,
    respData: { columns: 3 },
  },
}
export default HomeRoute
