import React, { PropTypes } from 'react'
import NavRecentGET from '../Nav/NavRecentGET.js'

export default npHistory = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
  },

  render: function () {    
    return (
      <NavRecentGET 
        styledForNavPanel={true} 
        navPanelIsOverlay={this.props.navPanelIsOverlay}
        currUser={this.props.currUser} />
    )
  }  
})