import React, { PropTypes } from 'react'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import WhatsNew from '/client/imports/components/Nav/WhatsNew'
import { logActivity } from '/imports/schemas/activity'
import { Header, Icon, Item } from 'semantic-ui-react'
//
export default npHome = React.createClass({

  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
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
    const { currUser } = this.props

    return (
      <div className="ui large vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>

        <Item>
          <Header as='h3' inverted style={{textAlign: "center"}}>
            MyGameBuilder
          </Header>
        </Item>

        <QLink to="/" className="header item">Home Page</QLink>
        <div className="menu">
          <QLink to="/whatsnew" className="item">
            What's New
            <WhatsNew currUser={currUser} />
          </QLink>
          <QLink to="/roadmap" className="item">Roadmap</QLink>
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
                
                className="item">
              <i className="user icon" /> My Profile
            </QLink>
            <QLink 
                to={`/u/${this.props.currUser.profile.name}/badges`} 
                id='mgbjr-np-home-myBadges'
                
                className="item">
              <i className="trophy icon" /> My Badges
            </QLink>
            <QLink 
                to={`/u/${this.props.currUser.profile.name}/games`} 
                
                id='mgbjr-np-home-myGames'
                className="item">
              <i className="game icon" /> My Games
            </QLink>
            <QLink 
                to={`/u/${this.props.currUser.profile.name}/projects`} 
                
                id='mgbjr-np-home-myProjects'                  
                className="item">
              <i className="sitemap icon" /> My Projects
            </QLink>
            <QLink 
                
                to={`/u/${currUser.username}/skilltree`} className="item"
                id='mgbjr-np-home-mySkills'>
              <Icon name='plus circle' /> My Skills
            </QLink>
            <QLink 
                
                query={{"_fp": 'features'}}  
                className="item"
                id='mgbjr-np-home-settings'>
              <Icon name='options' /> Settings
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
          <QLink 
              to="/login"  
              
              id='mgbjr-np-home-login'
              className="item" 
              key="login">
            Log In
          </QLink>,
          <QLink 
              to="/signup" 
              
              id='mgbjr-np-home-signup'
              className="item" 
              key="join">
            Sign Up
          </QLink>
        ]
        }
      </div>
    )
  }
})
