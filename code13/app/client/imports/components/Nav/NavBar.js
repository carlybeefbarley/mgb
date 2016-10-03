import _ from 'lodash'
import React, { PropTypes } from 'react'

import NavBarBreadcrumb from './NavBarBreadcrumb'
import NavBarGadget from './NavBarGadget'
import WhatsNew from './WhatsNew'

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column 
// on the left and the FlexPanel on the right). 

// The NavBar contains a breadcrumb bar (left) and a NavBarGadget (right).

// The NavBarGadget is primarily used for the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

export default NavBar = React.createClass({
  propTypes: {
    params:             PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser:           PropTypes.object,                 // Currently logged in user.. or null if not logged in.
    user:               PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
    navPanelWidth:      PropTypes.string.isRequired,      // Typically something like "60px". NavPanel is always visible, but width varies
    flexPanelWidth:     PropTypes.string.isRequired,      // Typically something like "200px".
    conserveSpace:      PropTypes.bool.isRequired,        // True if space should be used more conservatively               
    name:               PropTypes.string,                 // Page title to show in NavBar breadcrumb
    projectScopeLock:   PropTypes.string                  // If present, shows the ProjectScopeLock being applied. It is of form username.projectName
  },

  render: function() {
    const { name, user, params, currUser, conserveSpace, projectScopeLock } = this.props

    const sty = {
      position: "fixed",
      top:      "0px",
      left:     this.props.navPanelWidth, 
      right:    this.props.flexPanelWidth, 
      margin:   "0px"
    }

    const menuSty = {
      border: "none",
      boxShadow: "none"
    }
    
    const projectScopeLockRowStyle = {
      clear:        'both',
      background:   '#155f66',
	    background:   'radial-gradient(circle farthest-side at right bottom,#8cc4c4 8%, #155f66 70%, #232929)',
      color:        'white',
      paddingLeft:  '0.5em',
      paddingRight: '0.5em',
      padding:      '0.3em'
    }

    return (
      <div style={sty}>
        <div className="ui borderless menu" style={menuSty}>

          <WhatsNew currUser={currUser} asHidingLink={true}/>

          <div className="item">
            <NavBarBreadcrumb conserveSpace={conserveSpace} name={name} user={user} params={params} />
          </div>

          <div className="right menu">
            <NavBarGadget name={name} currUser={currUser}/>
          </div>
        </div>
        
        { !!projectScopeLock &&
          <div style={projectScopeLockRowStyle} >
            Project Scope Locked to: {projectScopeLock}
          </div>
        }

        </div>
    )
  }
})