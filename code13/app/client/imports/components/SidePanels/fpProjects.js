import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'
import { Menu, Icon, Message } from 'semantic-ui-react'
import { makeChannelName } from '/imports/schemas/chats'

const Empty = <Menu.Item content='(none)' />

const ChatIcon = ( { hazUnreadChats, projId }) => {
  const channelName = makeChannelName( { scopeGroupName: 'Project', scopeId: projId } )
  return !_.includes(hazUnreadChats, channelName) ? null : (
    <QLink 
        style={{ float: 'right' }}
        query={{ _fp: `chat.${channelName}` }} >
      <Icon name='chat' />
    </QLink>
  )
}

const ProjectMenu = ( { projects, ownedFlag, currUserId, hazUnreadChats } ) => 
{
  if (!projects || projects.length === 0) 
    return Empty

  const wantedProjects = _.filter(projects, p => ( (p.ownerId === currUserId) === ownedFlag ))
  const retval = wantedProjects.length === 0 ? Empty : wantedProjects.map( p => (
    <Menu.Item key={p._id}>
      <WorkState workState={p.workState} canEdit={false}/>
      { !ownedFlag && 
          <span>
            <QLink 
              to={`/u/${p.ownerName}`}
              altTo={`/u/${p.ownerName}/projects`} >
              {p.ownerName}
            </QLink>
            { ' : ' }
          </span> 
      }
      &ensp;
      <QLink 
          to={`/u/${p.ownerName}/projects/${p.name}`} 
          altTo={`/u/${p.ownerName}/assets`} 
          altQuery={{project:p.name}}
          title="click for project page; alt-click for project Assets" >
        { p.name } 
      </QLink>
      <ChatIcon hazUnreadChats={hazUnreadChats} projId={p._id} />
    </Menu.Item>
  ))
  return <Menu vertical fluid>{retval}</Menu>
}

const _propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  currUserProjects:   PropTypes.array,              // Projects list for currently logged in user
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth:         PropTypes.string.isRequired   // Typically something like "200px".
}

const fpProjects = ( { currUser, currUserProjects, hazUnreadChats } ) => {
  if (!currUser) 
    return <Message content="Not Logged in - no projects to show" />

  return (
    <div className='animated fadeIn '>
      <div className='ui fluid vertical menu'>
        <QLink
            to={`/u/${currUser.profile.name}/projects`} 
            className="header item" 
            title="Projects you are owner of">
          <Icon name='sitemap' /> My Owned Projects
        </QLink>

        <ProjectMenu 
            projects={currUserProjects} 
            ownedFlag={true}
            hazUnreadChats={hazUnreadChats}
            currUserId={currUser._id}/>
      </div>
  
      <div className='ui fluid vertical menu'>
        <QLink 
            to={`/u/${currUser.profile.name}/projects`} 
            className="header item" 
            title="Projects you are a member of">
          <Icon color='grey' name='sitemap' /> Project Memberships
        </QLink>
        <ProjectMenu 
            projects={currUserProjects} 
            ownedFlag={false}
            hazUnreadChats={hazUnreadChats}
            currUserId={currUser._id} />
      </div>
    </div>
  )
}

fpProjects.propTypes = _propTypes
export default fpProjects