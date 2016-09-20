import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

export default npPeople = React.createClass({

  propTypes: {
    navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
  },

  render: function () {
    const { navPanelIsOverlay } = this.props
    
    return (
      // TODO: use site.less for styling inverted menu
      <div className="ui vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>
        <div className="ui item" key="authHdr">
          <h3 className="ui inverted header" style={{textAlign: "center"}}>
            <i className="users icon" />
            People
          </h3>
        </div>
        <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/users" className="item">
          <i className="users icon" /> All Users
        </QLink>
        <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/assets" className="item">
          <i className="pencil icon" /> All Assets
        </QLink>
      </div>
    )
  }
})
