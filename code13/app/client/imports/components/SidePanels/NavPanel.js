import _ from 'lodash'
import React, { PropTypes } from 'react'
import npHome from './npHome'
import npUser from './npUser'
import npPeople from './npPeople'
import npHistory from './npHistory'
import npProjects from './npProjects'
import urlMaker from '/client/imports/routes/urlMaker'
import { utilPushTo } from '/client/imports/routes/QLink'

import style from './FlexPanel.css' // TODO(nico): get rid of this css

const navPanelViews = [
  {
    tag: "home",
    name: "home",
    icon: "home",
    hdr: "Home",
    getDirectUrl: (uname) => ("/"),
    el: npHome,
    hideIfNoUser: false
  },
  {
    tag: "user",
    name: "me",
    icon: "user",
    hdr: "User",
    getDirectUrl: (uname) => (uname ? `/u/${uname}` : '/signin'),
    el: npUser,
    hideIfNoUser: false
  },
  {
    tag: "projects",
    name: "projects",
    icon: "sitemap",
    hdr: "Projects",
    getDirectUrl: (uname) => (uname ? `/u/${uname}/projects` : '/u/!vault/projects'),
    el: npProjects,
    hideIfNoUser: true
  },
  {
    tag: "people",
    name: "people",
    icon: "users",
    hdr: "People",
    getDirectUrl: (uname) => (`/users`),
    el: npPeople,
    hideIfNoUser: false
  },
  {
    tag: "history",
    name: "history",
    icon: "history",
    hdr: "History",
    getDirectUrl: (uname) => (uname ? `/u/${uname}/assets` : '/assets'),
    el: npHistory,
    hideIfNoUser: true
  },
  // { tag: "skills",    icon: "university", hdr: "Skills" }
]

const defaultPanelViewIndex = 0

function _getNavPanelViewFromTag(npViewTag) {
  // If the navPanel choice isn't recognized, just default to using our 'default' one
  return _.find(navPanelViews, ['tag', npViewTag]) || navPanelViews[defaultPanelViewIndex]
}


export default NavPanel = React.createClass({

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the navPanelViews.tags values
    navPanelIsVisible:      PropTypes.bool.isRequired,
    handleNavPanelToggle:   PropTypes.func.isRequired,    // Callback for enabling/disabling NavPanel view
    handleNavPanelChange:   PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    navPanelWidth:          PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
  },

  statics: {
    getDefaultPanelViewTag: function() { return navPanelViews[defaultPanelViewIndex].tag }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  npViewSelect(npViewTag, fGoDirect)
  {
    if (fGoDirect)
    {
      // Go directly to the default URL for this NavPanel
      const navPanelChoice = _getNavPanelViewFromTag(npViewTag)
      const newUrl = navPanelChoice.getDirectUrl(this.props.currUser ? this.props.currUser.profile.name : null)
      if (newUrl)
        utilPushTo(this.context.urlLocation.query, newUrl)
    }
    else
    {
      if (npViewTag === this.props.selectedViewTag)
        this.props.handleNavPanelChange(urlMaker.disableQueryParamPrefix + npViewTag)
      else
        this.props.handleNavPanelChange(npViewTag)
    }
  },


  render: function () {
    const { navPanelWidth } = this.props
    const panelStyle = {    // This is the overall NavPanel with either just the first column (just icons, always shown), or 1st and 2nd columns
      position: "fixed",
      left: "0px",
      top: "0px",
      bottom: "0px",
      width: navPanelWidth,
      backgroundColor: "rgb(50, 60, 60)"
    }

    const miniNavStyle = {  // This is the First column of the NavPanel (just icons, always shown). It is logically nested within the outer panel
      position: "fixed",
      top: "0px",
      bottom: "0px",
      left: "0px",
      width: "61px",
      borderRadius: 0,
      marginRight: "0px",
      marginBottom: "0px",
      backgroundColor: "transparent"
    }

    const panelScrollContainerStyle = {
      position: "absolute",
      left: "60px",
      right: "0px",
      top: "0px",
      bottom: "0px",
      paddingTop: "8px",
      paddingLeft: "1px",
      backgroundColor: "rgb(40, 50, 50)",       // TODO: Use the less variables from the .ui.inverted.menu style, or see how to stretch this with semanticUI
      overflowY: "crop"
    }

    const miniNavItemStyle = {
      borderRadius: "0px"           // Otherwise active first-item / last-item is rounded
    }

    const navPanelChoice = _getNavPanelViewFromTag(this.props.selectedViewTag)
    const navPanelHdr = navPanelChoice.hdr
    const ElementNP = navPanelChoice.el    // Can be null

    return (
      <div className="basic segment mgbNavPanel" style={panelStyle}>

        <div className="ui inverted attached vertical icon menu" style={miniNavStyle}>
          { navPanelViews.map(v => {
            if (v.hideIfNoUser && !this.props.currUser)
              return null
            const actv = (v.tag === this.props.selectedViewTag) ? " active selected " : ""
            return (
              <div
                key={v.tag}
                className={actv + "item"}
                title={v.name}
                style={miniNavItemStyle}
                onClick={(e) => { this.npViewSelect(v.tag, e.altKey)}}>
                <i className={v.icon + actv + " big icon"} />
                <span>{v.name}</span>
              </div>
            )
          })}
        </div>

        { this.props.navPanelIsVisible &&
          <div style={panelScrollContainerStyle}>
            { !ElementNP ? <div className="ui fluid label">TODO: {navPanelHdr} navPanel</div> :
              <ElementNP
                currUser={this.props.currUser}
                currUserProjects={this.props.currUserProjects}
                user={this.props.user}
                panelWidth={this.props.navPanelWidth} />
            }
          </div>
        }
      </div>
    )
  }

})
