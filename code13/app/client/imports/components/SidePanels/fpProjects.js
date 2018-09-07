import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import QLink from '/client/imports/routes/QLink'
import WorkState from '/client/imports/components/Controls/WorkState'
import { Header, Icon, Menu, Message } from 'semantic-ui-react'
import { makeChannelName } from '/imports/schemas/chats'

const Empty = <Menu.Item content="(none)" />

const ChatIcon = ({ hazUnreadChats, projId }) => {
  const channelName = makeChannelName({ scopeGroupName: 'Project', scopeId: projId })
  return !_.includes(hazUnreadChats, channelName) ? null : (
    <QLink style={{ float: 'right' }} query={{ _fp: `chat.${channelName}` }}>
      <Icon name="chat" />
    </QLink>
  )
}

const ProjectMenu = ({ projects, ownedFlag, currUser, hazUnreadChats }) => {
  if (!projects || projects.length === 0) return Empty

  const wantedProjects = _.filter(projects, p => (p.ownerId === currUser._id) === ownedFlag)
  const retval =
    wantedProjects.length === 0
      ? Empty
      : wantedProjects.map(p => (
          <Menu.Item key={p._id}>
            <WorkState workState={p.workState} canEdit={false} />
            {!ownedFlag && (
              <span>
                <QLink to={`/u/${p.ownerName}`} altTo={`/u/${p.ownerName}/projects`}>
                  {p.ownerName}
                </QLink>
                {' : '}
              </span>
            )}
            &ensp;
            <QLink
              to={`/u/${p.ownerName}/projects/${p.name}`}
              altTo={`/u/${p.ownerName}/assets`}
              altQuery={{ project: p.name }}
              title="click for project page; alt-click for project Assets"
            >
              {p.name}
            </QLink>
            <ChatIcon hazUnreadChats={hazUnreadChats} projId={p._id} />
          </Menu.Item>
        ))
  return <Menu.Menu>{retval}</Menu.Menu>
}

const _propTypes = {
  currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
  currUserProjects: PropTypes.array, // Projects list for currently logged in user
  user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
}

const fpProjects = ({ currUser, currUserProjects, hazUnreadChats }) => {
  if (!currUser) return <Message content="User not found - no projects to show" />

  return (
    <div>
      <QLink to={`/u/${currUser.profile.name}/projects`}>
        <Header as="h3" content="My Projects" />
      </QLink>
      <Menu fluid vertical text>
        <ProjectMenu
          projects={currUserProjects}
          ownedFlag
          hazUnreadChats={hazUnreadChats}
          currUser={currUser}
        />
      </Menu>

      <Menu fluid vertical text>
        <QLink to={`/u/${currUser.profile.name}/projects`}>
          <Header as="h3" content="Project Memberships" />
        </QLink>
        <ProjectMenu
          projects={currUserProjects}
          ownedFlag={false}
          hazUnreadChats={hazUnreadChats}
          currUser={currUser}
        />
      </Menu>
    </div>
  )
}

fpProjects.propTypes = _propTypes
export default fpProjects
