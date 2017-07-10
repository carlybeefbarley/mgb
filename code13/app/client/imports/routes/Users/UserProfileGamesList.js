import React, { PropTypes } from 'react'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import { Header, Grid } from 'semantic-ui-react'

export const UserProfileGamesList = ({ user, width, currUser }) => {
  return (
    <Grid.Column width={width}>
      <GamesAvailableGET
        header={
          <Header as="h2">
            <QLink to={`/u/${user.username}/games`}>Published Games</QLink>
          </Header>
        }
        currUser={currUser}
        scopeToUserId={user._id}
      />
    </Grid.Column>
  )
}

UserProfileGamesList.propTypes = {
  width: PropTypes.number, // In semantic-ui columns
  user: PropTypes.object.isRequired,
  currUser: PropTypes.object,
}

export default UserProfileGamesList
