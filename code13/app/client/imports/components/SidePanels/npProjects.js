import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'

export default npProjects = React.createClass({

  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:   PropTypes.array,              // Projects list for currently logged in user
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
    navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
  },

  render: function () {
    const { currUser, currUserProjects, navPanelIsOverlay } = this.props

    if (!currUser)
      return null

    return (
      <div className="ui vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>
        <div>
          <div className="ui item" key="authHdr">
            <h3 className="ui inverted header" style={{textAlign: "center"}}>
              <i className="sitemap icon" />
              Projects
            </h3>
          </div>

          <QLink
              to={`/u/${this.props.currUser.profile.name}/projects`} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="header item" 
              title="Projects you are owner of">
            <i className="sitemap icon" /> My Owned Projects
          </QLink>
          <div className="menu">
            { this.renderProjectMenuItems(currUserProjects, true) }
          </div>

          <QLink 
              to={`/u/${this.props.currUser.profile.name}/projects/create`} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="item" 
              title="Create New Project">
            <i className="green sitemap icon" /> Create New Project
          </QLink>

          <QLink 
              to={`/u/${this.props.currUser.profile.name}/projects`} 
              closeNavPanelOnClick={navPanelIsOverlay}
              className="header item" 
              title="Projects you are a member of">
            <i className="grey sitemap icon" /> Project Memberships
          </QLink>
          <div className="menu">
            { this.renderProjectMenuItems(currUserProjects, false) }
          </div>

        </div>
      </div>
    )
  },

  renderProjectMenuItems(projects, ownedFlag)
  {
    const Empty = <div className="item">(none)</div>
    const { currUser, navPanelIsOverlay } = this.props

    var count = 0
    if (!projects || projects.length === 0)
      return Empty

    const retval = projects.map( (p) => {
      const isOwner = (p.ownerId === currUser._id)
      if (isOwner === ownedFlag)
      {
        count++
        return  <QLink 
                    to={`/u/${p.ownerName}/project/${p._id}`} 
                    closeNavPanelOnClick={navPanelIsOverlay}
                    className="item" 
                    key={p._id}>
                  <WorkState 
                      workState={p.workState} 
                      popupPosition="bottom center"
                      showMicro={true}
                      canEdit={false}/>                  
                  &emsp;{ p.name }
                </QLink>
      }
    })

    return count > 0 ? retval : Empty
  }
})