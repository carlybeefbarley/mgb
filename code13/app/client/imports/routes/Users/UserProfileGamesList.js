import PropTypes from 'prop-types'
import React from 'react'
import { Header, Grid, Icon } from 'semantic-ui-react'
import GamesAvailableGET from '/client/imports/components/Assets/GameAsset/GamesAvailableGET'
import QLink from '/client/imports/routes/QLink'

export const UserProfileGamesList = ({ user, width, currUser }) => {
  return (
    <Grid.Column width={width}>
      <GamesAvailableGET
        header={
          <Header as="h4">
            <QLink to={`/u/${user.username}/games`}>
              Go To All of {user === currUser ? 'Your' : `${user.username}'s`} Games{' '}
              <Icon name="right angle" />
            </QLink>
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
