import React, { PropTypes } from 'react'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
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

        <div className="header item">My Game Builder</div>
        <div className="menu">
          <QLink closeNavPanelOnClick={navPanelIsOverlay} to="/" className="item">Home Page</QLink>
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
              <Icon name='user' />
              <img className="ui centered avatar image" src={currUser.profile.avatar} />
              &emsp;{currUser.profile.name}
            </Item.Header>,
            
            <div key='k2' className="menu">
              <QLink key='k2'
                  to={`/u/${this.props.currUser.profile.name}`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                <i className="user icon" /> My Profile
              </QLink>
              <QLink 
                  to={`/u/${this.props.currUser.profile.name}/badges`} 
                  closeNavPanelOnClick={navPanelIsOverlay} 
                  className="item">
                <i className="user icon" /> My Badges
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
