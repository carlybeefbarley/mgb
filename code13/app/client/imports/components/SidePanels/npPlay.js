import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npPlay = ( { currUser, navPanelIsOverlay} ) => (
  <div className="ui vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='game' />
        Play
      </Header>
    </Item>

    <div className="header item">Start a Game</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/games" className="item">Search All Games</QLink>
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/notyetimplemented/games_featured" className="item">Featured Games</QLink>
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/notyetimplemented/games_new" className="item">New Games</QLink>
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/notyetimplemented/games_top" className="item">Top Games</QLink>
      { 
      // <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/notyetimplemented/games_favorite" className="item">Favorite Games</QLink>
      // <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/notyetimplemented/games_friends" className="item">Friends Games</QLink>
      }
    </div>

    <div className="header item">Continue a Game</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/games" className="item">
        (no saved games yet)
      </QLink>
    </div>
  </div>
)

npPlay.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
  navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
}

export default npPlay