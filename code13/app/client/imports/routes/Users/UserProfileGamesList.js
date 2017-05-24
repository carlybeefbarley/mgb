import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import { Header, Grid } from 'semantic-ui-react'

export const UserProfileGamesList = ( { user, width, currUser } ) => (
  <Grid.Column width={width}>
      <Helmet
        title={user.profile.name}
        meta={[ {"name": "description", "content": user.profile.name + "\'s Games"} ]}
      />
      { user ? 
          <div>
            <Header as='h2'>
              <QLink to={`/u/${user.profile.name}/games`}>Games</QLink> 
            </Header>
            <GamesAvailableGET currUser={currUser} scopeToUserId={user._id}/>
          </div>
        :
          <ThingNotFound type="User" />
      }
  </Grid.Column>
)

UserProfileGamesList.propTypes = {
  query: PropTypes.object,
  width: PropTypes.number,  // In semantic=ui columns
  user: PropTypes.object,
  currUser: PropTypes.object,
  ownsProfile: PropTypes.bool
}

export default UserProfileGamesList