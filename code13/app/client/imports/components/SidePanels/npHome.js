import React, { PropTypes } from 'react'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'
import { logActivity } from '/imports/schemas/activity'
import { Header, Icon, Item } from 'semantic-ui-react'

export default npHome = React.createClass({

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
      <div className="ui vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>

        <Item>
          <Header as='h3' inverted style={{textAlign: "center"}}>
            MyGameBuilder
          </Header>
        </Item>

        <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/" className="header item">Home Page</QLink>
        <div className="menu">
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/whatsnew" className="item">
            What's New
            <WhatsNew currUser={currUser} />
          </QLink>
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/roadmap" className="item">Roadmap</QLink>
          <div className='item'></div>
        </div>

        { currUser ?
          [
            <Item.Header key='k1' className="header item">
              <img className="ui centered avatar image" src={currUser.profile.avatar} />
              &emsp;{currUser.profile.name}
            </Item.Header>,
            
            <div key='k2' className="menu">
              <QLink
                  to={`/u/${this.props.currUser.profile.name}`} 
                  id='mgbjr-np-home-myProfile'
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                <i className="user icon" /> My Profile
              </QLink>
              <QLink 
                  to={`/u/${this.props.currUser.profile.name}/badges`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                My Badges
              </QLink>
              <QLink 
                  to={`/u/${this.props.currUser.profile.name}/games`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                <i className="game icon" /> My Games
              </QLink>
              <QLink 
                  to={`/u/${this.props.currUser.profile.name}/projects`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                <i className="sitemap icon" /> My Projects
              </QLink>
              <div className='item'></div>
            </div>,
            
            <a key='k3' href="#" onClick={this.logout} className="item">
              <i className="sign out icon" /> Logout
            </a>
          ]
          :
          // If signed out, show   | Log In, Sign up |  options inline
          [
            <QLink to="/login"  closeNavPanelOnClick={navPanelIsOverlay} className="item" key="login">Log In</QLink>,
            <QLink to="/signup" closeNavPanelOnClick={navPanelIsOverlay} className="item" key="join">Sign Up</QLink>
          ]
        }
      </div>
    )
  }
})
