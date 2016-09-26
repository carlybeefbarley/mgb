import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'
import { Menu, Header, Icon } from 'stardust'

const _styleNoBg = {backgroundColor: "transparent"}

const ProjectMenu = (props) => 
{
  const { projects, ownedFlag, currUserId, navPanelIsOverlay } = props
  const Empty = <Menu.Item content="(none)" />
  if (!projects || projects.length === 0) return Empty

  const wantedProjects = _.filter(projects, p => ( (p.ownerId === currUserId) === ownedFlag ))
  const retval = wantedProjects.length === 0 ? Empty : wantedProjects.map( p => (
    <Menu.Item key={p._id}>
      <QLink 
          to={`/u/${p.ownerName}/project/${p._id}`} 
          altTo={`/u/${p.ownerName}/assets`} 
          altQuery={{project:p.name}}
          closeNavPanelOnClick={navPanelIsOverlay}
          title="click for project page; alt-click for project Assets"
          >
        <WorkState 
            workState={p.workState} 
            popupPosition="bottom center"
            showMicro={true}
            canEdit={false}/>                  
        &emsp;{ p.name } 
      </QLink>
      { !ownedFlag && 
          <small>&emsp;
            <QLink 
              closeNavPanelOnClick={navPanelIsOverlay} 
              to={`/u/${p.ownerName}`}
              altTo={`/u/${p.ownerName}/projects`} >
              @{p.ownerName}
            </QLink>
          </small> 
      }
    </Menu.Item>
  ))
  return <Menu vertical inverted fluid style={_styleNoBg}>{retval}</Menu>
}

const _propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  currUserProjects:   PropTypes.array,              // Projects list for currently logged in user
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
  navPanelIsOverlay:  PropTypes.bool.isRequired     // If true, then show NavPanel with some Alpha to hint that there is stuff below. Also we must close NavPanel when NavPanel's links are clicked'
}

const npProjects = (props) => {
  const { currUser, currUserProjects, navPanelIsOverlay } = props
  if (!currUser) return null

  return (
    <Menu vertical inverted fluid style={_styleNoBg}>
      <Menu.Item>
        <Header as='h3' inverted textAlign='center' >
          <Header.Content>
            <Icon name='sitemap' />
            Projects
          </Header.Content>
        </Header>  
      </Menu.Item>

      <QLink
          to={`/u/${currUser.profile.name}/projects`} 
          closeNavPanelOnClick={navPanelIsOverlay}
          className="header item" 
          title="Projects you are owner of">
        <Icon name='sitemap' /> My Owned Projects
      </QLink>
      <ProjectMenu 
          projects={currUserProjects} 
          ownedFlag={true}
          currUserId={currUser._id}
          navPanelIsOverlay={navPanelIsOverlay} />

      <QLink 
          to={`/u/${currUser.profile.name}/projects/create`} 
          closeNavPanelOnClick={navPanelIsOverlay}
          className="item" 
          title="Create New Project">
        <Icon name='green sitemap' /> Create New Project
      </QLink>

      <QLink 
          to={`/u/${currUser.profile.name}/projects`} 
          closeNavPanelOnClick={navPanelIsOverlay}
          className="header item" 
          title="Projects you are a member of">
        <Icon name='grey sitemap' /> Project Memberships
      </QLink>
      <ProjectMenu 
          projects={currUserProjects} 
          ownedFlag={false}
          currUserId={currUser._id}
          navPanelIsOverlay={navPanelIsOverlay} />
    </Menu>
  )
}

npProjects.propTypes = _propTypes
export default npProjects