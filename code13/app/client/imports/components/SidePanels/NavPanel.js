import _ from 'lodash'
import React, { PropTypes } from 'react'
import npHome from './npHome'
import npPlay from './npPlay'
import npLearn from './npLearn'
import npCreate from './npCreate'
import npPeople from './npPeople'
import npHistory from './npHistory'
import npProjects from './npProjects'
import urlMaker from '/client/imports/routes/urlMaker'
import { utilPushTo } from '/client/imports/routes/QLink'
import { getFeatureLevel } from '/imports/schemas/settings-client'

const _npFeatureLevelHideWords = 4

import style from './FlexPanel.css' // TODO(nico): get rid of this css

const navPanelViews = [
  {
    tag: "home",
    name: "home",
    icon: "home",
    hdr: "Home",
    getDirectUrl: (uname) => (uname ? `/u/${uname}` : '/login'),
    el: npHome,
    hideIfNoUser: false,
  },
  {
    tag: "play",
    name: "play",
    icon: "play",
    hdr: "Play",
    getDirectUrl: () => (`/play`),
    el: npPlay,
    hideIfNoUser: false
  },
  {
    tag: "learn",
    name: "learn",
    icon: "student",
    hdr: "Learn",
    getDirectUrl: () => (`/getstarted/games`),
    el: npLearn,
    hideIfNoUser: false
  },
  {
    tag: "create",
    name: "create",
    icon: "pencil",
    hdr: "Create",
    getDirectUrl: () => (`/assets/create`),
    el: npCreate,
    hideIfNoUser: false
  },  
  {
    tag: "meet",
    name: "meet",
    icon: "street view",
    hdr: "Meet",
    getDirectUrl: () => (`/users`),
    el: npPeople,
    hideIfNoUser: false
  },
  {
    tag: "projects",
    name: "projects",
    icon: "sitemap",
    hdr: "Projects",
    getDirectUrl: (uname) => (uname ? `/u/${uname}/projects` : '/u/!vault/projects'),
    el: npProjects,
    hideIfNoUser: true,
    hideIfFewProjects: true,
    showAtNavPanelFeatureLevel: 2    
  },
  {
    tag: "history",
    name: "history",
    icon: "history",
    hdr: "History",
    getDirectUrl: (uname) => (uname ? `/u/${uname}/assets` : '/assets'),
    el: npHistory,
    hideIfNoUser: true,
    hideIfLittleHistory: true,
    showAtNavPanelFeatureLevel: 3
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
    navPanelIsOverlay:      PropTypes.bool.isRequired,    // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
  },

  statics: {
    getDefaultPanelViewTag: function() { return navPanelViews[defaultPanelViewIndex].tag }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
    settings:    PropTypes.object                         // Used so some panels can be hidden by user
  },

  // 
  /**
   * @param {String} npViewTag
   * @param {Boolean} fGoDirect - If true, go directly to the default URL for this NavPanel
   * @param {Boolean} fLockNavPanel - If true, request the navPanel to be locked (disable auto-hide / navPanelIsOverlay)
   */
  npViewSelect(npViewTag, fGoDirect, fLockNavPanel)
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
        this.props.handleNavPanelChange(npViewTag, fLockNavPanel)
    }
  },


  render: function () {
    const { user, currUser, navPanelWidth, navPanelIsOverlay, selectedViewTag, navPanelIsVisible, currUserProjects } = this.props
    const panelStyle = {    // This is the overall NavPanel with either just the first column (just icons, always shown), or 1st and 2nd columns
      position: "fixed",
      left: "0px",
      top: "0px",
      bottom: "0px",
      width: navPanelWidth,
      backgroundColor: `rgba(50, 60, 60, ${navPanelIsOverlay ? 0.85 : 1})`,
      zIndex: 100
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
      backgroundColor: "rgba(50, 60, 60, 1)"
    }

    const panelScrollContainerStyle = {
      position: "absolute",
      left: "60px",
      right: "0px",
      top: "0px",
      bottom: "0px",
      paddingTop: "8px",
      paddingLeft: "1px",
      backgroundColor: `rgba(40, 50, 50, ${navPanelIsOverlay ? 0.85 : 1})`,       // TODO: Use the less variables from the .ui.inverted.menu style, or see how to stretch this with semanticUI
      overflowY: "crop"
    }

    const miniNavItemStyle = {
      borderRadius: "0px"           // Otherwise active first-item / last-item is rounded
    }

    const navPanelChoice = _getNavPanelViewFromTag(selectedViewTag)
    const navPanelHdr = navPanelChoice.hdr
    const ElementNP = navPanelChoice.el    // Can be null
    const npFeatureLevel = getFeatureLevel(this.context.settings, 'toolbar-level-NavPanel') || 2

    return (
      <div className="basic segment mgbNavPanel" style={panelStyle}>

        <div className="ui inverted attached vertical icon menu" style={miniNavStyle}>
          { navPanelViews.map(v => {
            if (v.hideIfNoUser && !currUser)
              return null
            if (v.hideIfFewProjects && currUser && (!currUserProjects || currUserProjects.length < 3))
              return null

            if (v.showAtNavPanelFeatureLevel && npFeatureLevel < v.showAtNavPanelFeatureLevel)
              return
              
            const actv = (v.tag === selectedViewTag) ? " active selected " : ""
            return (
              <div
                key={v.tag}
                className={actv + 'item animated fadeInLeft'}
                title={v.name}
                style={miniNavItemStyle}
                onClick={(e) => { this.npViewSelect(v.tag, e.altKey, e.shiftKey)}}>
                <i className={v.icon + actv + " big icon"} />
                { npFeatureLevel < _npFeatureLevelHideWords && 
                  <span style={{opacity: '0.3'}}>{v.name}</span>
                }
              </div>
            )
          })}
        </div>

        { navPanelIsVisible &&
          <div style={panelScrollContainerStyle}>
            { !ElementNP ? <div className="ui fluid label">TODO: {navPanelHdr} navPanel</div> :
              <ElementNP
                currUser={currUser}
                currUserProjects={currUserProjects}
                user={user}
                navPanelIsOverlay={navPanelIsOverlay}
                panelWidth={navPanelWidth} />
            }
          </div>
        }
      </div>
    )
  }

})