import React, { PropTypes } from 'react'
import SystemAlerts from './SystemAlerts'
import NavBarBreadcrumb from './NavBarBreadcrumb'
import NavBarGadget from './NavBarGadget'
import WhatsNew from './WhatsNew'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column 
// on the left and the FlexPanel on the right). 

// The NavBar contains a breadcrumb bar (left) and a NavBarGadget (right).

// The NavBarGadget is primarily used for the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

const _projectScopeLockRowStyle = {
  clear:        'both',
//background:   '#155f66',
  background:   'radial-gradient(circle farthest-side at right bottom,#8cc4c4 8%, #155f66 70%, #232929)',
  color:        'white',
  paddingLeft:  '0.5em',
  paddingRight: '0.5em',
  padding:      '0.3em'
}

const ProjectScopeBar = ({ projectScopeLock }) => (
  !projectScopeLock ? null : 
    <div style={_projectScopeLockRowStyle} >
      Project Scope Locked to: {projectScopeLock}
    </div> 
)

const _menuStyle = {
  border: "none",
  boxShadow: "none"
}

const NavBar = ({ name, user, params, currUser, pathLocation, conserveSpace, projectScopeLock, navPanelWidth, flexPanelWidth, sysvars }) => (
  <div style={{
    position:   'fixed',
    top:        '0px',
    left:       navPanelWidth, 
    right:      flexPanelWidth, 
    margin:     '0px'
  }}>
    <div className="ui borderless menu" style={_menuStyle}>
      <SystemAlerts sysvars={sysvars}/>
      <WhatsNew currUser={currUser} asHidingLink={true}/>
      <div className="item">
        <NavBarBreadcrumb pathLocation={pathLocation} conserveSpace={conserveSpace} name={name} user={user} params={params} />
      </div>
      <div className="right menu">
        <NavBarGadget name={name} currUser={currUser}/>
      </div>
    </div>
    <ProjectScopeBar projectScopeLock={projectScopeLock} />
    </div>
)

NavBar.propTypes = {
  params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
  currUser:           PropTypes.object,                 // Currently logged in user.. or null if not logged in.
  user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
  pathLocation:       PropTypes.string,                 // basically windows.location.pathname, but via this.props.location.pathname from App.js
  navPanelWidth:      PropTypes.string.isRequired,      // Typically something like "60px". NavPanel is always visible, but width varies
  flexPanelWidth:     PropTypes.string.isRequired,      // Typically something like "200px".
  conserveSpace:      PropTypes.bool.isRequired,        // True if space should be used more conservatively               
  name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
  projectScopeLock:   PropTypes.string                  // If present, shows the ProjectScopeLock being applied. It is of form username.projectName
}

export default NavBar