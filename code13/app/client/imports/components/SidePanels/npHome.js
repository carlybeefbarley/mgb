import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import WhatsNew from '../Nav/WhatsNew'


export default npHome = React.createClass({

  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
    navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
  },

  render: function () {
    const { currUser, navPanelIsOverlay } = this.props

    return (
       // TODO: use site.less for styling inverted menu
      <div className="ui vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
        <div className="ui item" key="authHdr">
          <h3 className="ui inverted header" style={{textAlign: "center"}}>
            <i className="home icon" />
            Home
          </h3>
        </div>

        <div className="header item">My Game Builder v2</div>
        <div className="menu">
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/" className="item">Home Page</QLink>
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/getstarted" className="item">Get Started</QLink>
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/whatsnew" className="item">
            What's New
            <WhatsNew currUser={currUser} />
          </QLink>
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/roadmap" className="item">Roadmap</QLink>
        </div>

        <div className="header item">Common Tasks</div>
        <div className="menu">
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/assets/create" className="item">
            <i className="green pencil icon" />
            Create New Asset
          </QLink>
        </div>
      </div>
    )
  }
})
