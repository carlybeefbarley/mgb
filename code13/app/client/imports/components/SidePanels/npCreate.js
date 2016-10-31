import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npCreate = ( { currUser, navPanelIsOverlay} ) => (
  <div className="ui vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='pencil' />
        Create
      </Header>
    </Item>

    { currUser &&
      <div>
        <QLink 
            to={`/u/${currUser.profile.name}/assets`} 
            closeNavPanelOnClick={navPanelIsOverlay} 
            className="item">
          <Icon name='pencil' /> My Assets
        </QLink>
        <div className="menu">
          <QLink 
              to={`/assets/create`} 
              closeNavPanelOnClick={navPanelIsOverlay} 
              className="item" 
              title="Create New Asset">
            <Icon color='green' name='pencil' /> Create New Asset
          </QLink>
        </div>

        <QLink 
            to={`/u/${currUser.profile.name}/projects`} 
            closeNavPanelOnClick={navPanelIsOverlay} 
            className="item">
          <Icon name='sitemap' /> My Projects
        </QLink>
        <div className="menu">
          <QLink 
              to={`/u/${currUser.profile.name}/projects/create`} 
              closeNavPanelOnClick={navPanelIsOverlay} 
              className="item" 
              title="Create New Project">
            <Icon color='green' name='sitemap' /> Create New Project
          </QLink>
        </div>
      </div>
    }
  </div>
)

npCreate.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
  navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
}

export default npCreate