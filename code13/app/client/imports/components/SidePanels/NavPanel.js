import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { utilPushTo } from '/client/imports/routes/QLink'

import npHome from './npHome'
import npPlay from './npPlay'
import npLearn from './npLearn'
import npCreate from './npCreate'
import npPeople from './npPeople'
import npHistory from './npHistory'
import npProjects from './npProjects'
import urlMaker from '/client/imports/routes/urlMaker'

import reactMixin from 'react-mixin'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

const _npFeatureLevelHideWords = 4  // At this NavPanel featureLevel (or greater), don't show the words for the icons

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
    tag: "learn",
    name: "learn",
    icon: "student",
    hdr: "Learn",
    getDirectUrl: () => (`/learn`),
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
    tag: "play",
    name: "play",
    icon: "game",
    hdr: "Play",
    getDirectUrl: () => (`/games`),
    el: npPlay,
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
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user
    navPanelWidth:          PropTypes.string,             // e.g. '60px'.. Width of reserved space
    fpReservedFooterHeight: PropTypes.string.isRequired   // Something like 0px or 60px typically
  },

  getInitialState: function() {
    return {
      selectedViewTag: null               // One of the navPanelViews.tags values
    }
  },


  statics: {
    getDefaultPanelViewTag: function() { return navPanelViews[defaultPanelViewIndex].tag }
  },

  contextTypes: {
    urlLocation: React.PropTypes.object,
    settings:    PropTypes.object                         // Used so some panels can be hidden by user
  },

  getMeteorData: function() {
    return { npFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('NavPanel'))}
  },

  componentDidMount: function() {
    registerDebugGlobal( 'np', this, __filename, 'The global NavPanel instance')
  },

  // 
  /**
   * @param {String} npViewTag
   * @param {Boolean} fGoDirect - If true, go directly to the default URL for this NavPanel
   */
  npViewSelect(npViewTag, fGoDirect)
  {
    if (fGoDirect)
    {
      // Go directly to the default URL for this NavPanel
      const navPanelChoice = _getNavPanelViewFromTag(npViewTag)
      const newUrl = navPanelChoice.getDirectUrl(this.props.currUser ? this.props.currUser.profile.name : null)
      if (newUrl)
      {
        this.handleNavPanelClose()
        utilPushTo(this.context.urlLocation.query, newUrl)
      }
    }
    else
      this.setState( { selectedViewTag: npViewTag })
  },

  handleNavPanelClose() {
    this.setState( { selectedViewTag: null })
  },


  render: function () {
    const { currUser, navPanelWidth, currUserProjects, fpReservedFooterHeight } = this.props
    const { selectedViewTag } = this.state
    const panelStyle = {    // This is the overall NavPanel with either just the first column (just icons, always shown), or 1st and 2nd columns
      position: "fixed",
      left: "0px",
      top: "0px",
      bottom: fpReservedFooterHeight, //61?
      width: selectedViewTag ? '261px' : navPanelWidth,
      backgroundColor: `rgba(50, 60, 60, 1)`,
      overflowX: 'visible',
      zIndex: 100
    }

    const miniNavStyle = {  // This is the First column of the NavPanel (just icons, always shown). It is logically nested within the outer panel
      position: "fixed",
      top: "0px",
      bottom: fpReservedFooterHeight, // 61?
      left: "0px",
      width: "61px",
      borderRadius: 0,
      marginRight: "0px",
      marginBottom: "0px",
      backgroundColor: "rgba(50, 60, 60, 1)",
      overflowY:    "auto"
    }

    const panelScrollContainerStyle = {
      position:     "absolute",
      left:         "60px",
      right:        "0px",
      top:          "0px",
      bottom:       "0px",
      paddingTop:   "8px",
      paddingLeft:  "1px",
      backgroundColor: `rgba(40, 50, 50, 1)`,       // TODO: Use the less variables from the .ui.inverted.menu style, or see how to stretch this with semanticUI
      overflowY:    "auto"
    }

    const miniNavItemStyle = {
      borderRadius: "0px"           // Otherwise active first-item / last-item is rounded
    }
    const miniNavAvatarItemStyle = {
      borderRadius:  "0px",          // Otherwise active first-item / last-item is rounded
      paddingTop:    "8px",
      paddingBottom: "8px"
    }

    const navPanelChoice = _getNavPanelViewFromTag(selectedViewTag)
    const navPanelHdr = navPanelChoice.hdr
    const ElementNP = navPanelChoice.el    // Can be null
    const npFeatureLevel = this.data.npFeatureLevel || 2
    const hasAvatar = (currUser && currUser.profile && currUser.profile.avatar)
    if (selectedViewTag && ElementNP !== null)
      joyrideCompleteTag(`mgbjr-CT-navPanel-${navPanelChoice.tag}-show`)

    return (
      <div  id='mgbjr-navPanelIcons' 
            className="basic segment mgbNavPanel" 
            style={panelStyle}
            onMouseLeave={ () => this.handleNavPanelClose() } >

        <div className="ui inverted attached vertical icon menu" style={miniNavStyle}>
          { navPanelViews.map(v => {
            if (v.hideIfNoUser && !currUser)
              return null
            if (v.hideIfFewProjects && currUser && (!currUserProjects || currUserProjects.length < 3))
              return null

            if (v.showAtNavPanelFeatureLevel && npFeatureLevel < v.showAtNavPanelFeatureLevel)
              return
              
            const actv = (v.tag === selectedViewTag) ? " active selected " : ""
            const showAvatarInsteadOfIcon =  (v.tag === 'home' && hasAvatar)
            return (
              <div
                key={v.tag}
                id={`mgbjr-navPanelIcons-${v.tag}`}
                className={actv + 'item animated fadeInLeft'}
                title={v.name}
                style={showAvatarInsteadOfIcon ? miniNavAvatarItemStyle : miniNavItemStyle}
                onMouseEnter={() => { this.npViewSelect(v.tag, false)}}
                onClick={() => { this.npViewSelect(v.tag, true)}}>
                { showAvatarInsteadOfIcon ? 
                  <img className="ui centered avatar image" style={{ width: '3em', height: '3em'}} src={makeCDNLink(currUser.profile.avatar)} />
                  :
                  <i className={v.icon + actv + " big icon"} />
                }
                { (npFeatureLevel < _npFeatureLevelHideWords && !showAvatarInsteadOfIcon) && 
                  <span style={{opacity: '0.3'}}>{v.name}</span>
                }
              </div>
            )
          })}
        </div>

        { selectedViewTag &&
          <div style={panelScrollContainerStyle}>
            { !ElementNP ? <div className="ui fluid label">TODO: {navPanelHdr} navPanel</div> :
              <ElementNP
                currUser={currUser}
                currUserProjects={currUserProjects}
                panelWidth={navPanelWidth} />
            }
          </div>
        }
      </div>
    )
  }

})
