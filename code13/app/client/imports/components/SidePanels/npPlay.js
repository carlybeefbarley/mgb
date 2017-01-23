import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npPlay = ( { currUser } ) => (
  <div className="ui large vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='game' />
        Play
      </Header>
    </Item>

    <div className="header item">Start a Game</div>
    <div className="menu">
      <QLink id='mgbjr-np-play-popularGames' to="/games" query={{ sort: 'plays' }} className="item">Popular Games</QLink>
      <QLink id='mgbjr-np-play-updatedGames' to="/games" query={{ sort: 'edited' }} className="item">Updated Games</QLink>
      { currUser && 
        <QLink id='mgbjr-np-play-gamesImade' to={`/u/${currUser.username}/games`} className="item">Games I made</QLink>
      }
      { 
        /* Reminder to do this in future:
        currUser && 
        <QLink to={`/u/${currUser.username}/games`} className="item">Games I have played</QLink>
        */
      }
      { 
      // <QLink to="/notyetimplemented/games_favorite" className="item">Favorite Games</QLink>
      // <QLink to="/notyetimplemented/games_friends" className="item">Friends Games</QLink>
      }
    </div>

    <div className="header item">Continue a Game</div>
    <div className="menu">
      <QLink to="/games" className="item">
        (no saved games yet)
      </QLink>
    </div>
  </div>
)

npPlay.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  panelWidth:         PropTypes.string.isRequired   // Typically something like "200px".
}

export default npPlay