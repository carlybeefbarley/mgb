import React, { PropTypes } from 'react'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { logActivity } from '/imports/schemas/activity'

export default npUser = React.createClass({

  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px".
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },


  logout: function() {
    let userName = Meteor.user().profile.name
    logActivity("user.logout",  `Logging out "${userName}"`, null, null)

    Meteor.logout()
    utilPushTo(this.context.urlLocation.query, "/")
  },

  render: function () {
    const { currUser, navPanelIsOverlay } = this.props

    return (
      // TODO: use site.less for styling inverted menu
      <div className="ui vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>
        { currUser ?
          <div>
            <div className="ui item" key="authHdr">
              <h3 className="ui inverted header" style={{textAlign: "center"}}>
                <i className="user icon" />
                {currUser.profile.name}
              </h3>
              <img className="ui centered small image" src={currUser.profile.avatar} />
            </div>

            <QLink 
                to={`/u/${this.props.currUser.profile.name}`} 
                closeNavPanelOnClick={navPanelIsOverlay} 
                className="item">
              <i className="user icon" /> My Profile
            </QLink>

            <QLink 
                to={`/u/${this.props.currUser.profile.name}/assets`} 
                closeNavPanelOnClick={navPanelIsOverlay} 
                className="item">
              <i className="pencil icon" /> My Assets
            </QLink>
            <div className="menu">
              <QLink 
                  to={`/assets/create`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item" 
                  title="Create New Asset">
                <i className="green pencil icon" /> Create New Asset
              </QLink>
            </div>

            <QLink 
                to={`/u/${this.props.currUser.profile.name}/projects`} 
                closeNavPanelOnClick={navPanelIsOverlay} 
                className="item">
              <i className="sitemap icon" /> My Projects
            </QLink>
            <div className="menu">
              <QLink 
                  to={`/u/${this.props.currUser.profile.name}/projects/create`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item" 
                  title="Create New Project">
                <i className="green sitemap icon" /> Create New Project
              </QLink>
            </div>

            <div className="item"></div>

            <a href="#" onClick={this.logout} className="ui item">
              <i className="sign out icon" /> Logout
            </a>
          </div>
          :
          // If signed out, show   | Sign-in, Join |  options inline
          [
            <div className="ui item" key="authHdr">
              <h3 className="ui inverted header" style={{textAlign: "center"}}>
                <i className="user icon" />
                Login
              </h3>
            </div>,
            <QLink to="/signin" closeNavPanelOnClick={navPanelIsOverlay} className="item" key="login">Login</QLink>,
            <QLink to="/join" closeNavPanelOnClick={navPanelIsOverlay} className="item" key="join">Join</QLink>
          ]
        }
      </div>
    )
  }
})
