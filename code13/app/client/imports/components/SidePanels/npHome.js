import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import WhatsNew from '../Nav/WhatsNew'
import { Header, Icon, Item } from 'semantic-ui-react'

const npHome = ( { currUser, navPanelIsOverlay} ) => (
  <div className="ui vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='home' />
        Home
      </Header>
    </Item>

    <div className="header item">My Game Builder v2</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/" className="item">Home Page</QLink>
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/whatsnew" className="item">
        What's New
        <WhatsNew currUser={currUser} />
      </QLink>
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/roadmap" className="item">Roadmap</QLink>
    </div>

    <div className="header item">Common Tasks</div>
    <div className="menu">
      <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/assets/create" className="item">
        <Icon color='green' name='pencil' />
        Create New Asset
      </QLink>
    </div>
  </div>
)

npHome.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
  navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
}

export default npHome