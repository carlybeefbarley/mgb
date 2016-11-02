import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npLearn = ( { currUser, navPanelIsOverlay} ) => (
  <div className="ui vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='student' />
        Learn
      </Header>
    </Item>

    <div className="header item">Learn</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/getstarted" className="item">Learn to do cool stuff</QLink>
    </div>

    <div className="header item">Active Tutorials</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/getstarted/skills" className="item">
        <Icon color='green' name='student' />
        Start new Tutorial
      </QLink>
    </div>
  </div>
)

npLearn.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
  navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
}

export default npLearn