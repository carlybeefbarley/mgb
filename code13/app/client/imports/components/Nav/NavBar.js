import _ from 'lodash';
import React, { PropTypes } from 'react';
import WhatsNew from './WhatsNew';
import NavBarBreadcrumb from './NavBarBreadcrumb';
import NavBarGadget from './NavBarGadget';

// The NavBar is the top row of the central column of the page (i.e. between the NavPanel column 
// on the left and the FlexPanel on the right). 

// The NavBar contains a breadcrumb bar (left) and a NavBarGadget (right).

// The NavBarGadget is primarily used for the Level slider that adjusts UX complexity
// of any page from Beginner to Guru - hiding advanced options etc

export default NavBar = React.createClass({
  
  propTypes: {
    params:                 PropTypes.object.isRequired,      // The :params from /imports/routes/index.js via App.js. See there for description of params
    currUser:               PropTypes.object,                 // Currently logged in user.. or null if not logged in.
    user:                   PropTypes.object,                 // If there is a :id user id  or :username on the path, this is the user record for it
    flexPanelWidth:         PropTypes.string.isRequired,      // Typically something like "200px".
    navPanelWidth:          PropTypes.string.isRequired,      // Typically something like "60px". NavPanel is always visible, but width varies
    name:                   PropTypes.string                  // Page title to show in NavBar breadcrumb
  },


  render: function() {
    const { name, user, params, currUser } = this.props

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
    
    return (
      <div style={sty}>
      <div className="ui borderless menu" style={menuSty}>

          <WhatsNew currUser={currUser} asHidingLink={true}/>

          <div className="item">
            <NavBarBreadcrumb name={name} user={user} params={params} />
          </div>

          <div className="right menu">
            <NavBarGadget name={name} currUser={currUser}/>
          </div>
        </div>
        </div>
    );
  }
})