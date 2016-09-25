import React, { PropTypes } from 'react'
import { Grid, Header, Image, Icon } from 'stardust'
import { getProjectAvatarUrl } from '/imports/schemas/projects'
import QLink from '/client/imports/routes/QLink'

const SomeProjects = props => {
  const { user, projects, ownedFlag } = props
  const Empty = <p>No projects</p>

  if (!projects) return null
  if (projects.length === 0) return Empty
    
  const retval = projects.map( (project) => {
    const isOwner = (project.ownerId === props.user._id)
    const MemberStr = (!project.memberIds || project.memberIds.length === 0) ? "1 Member" : (project.memberIds.length + 1) + " Members"
    const projImg = getProjectAvatarUrl(project)

    return (isOwner !== ownedFlag) ? null : (
      <Grid key={project._id}>
        <Grid.Column width={4}>
          <Image fluid src={projImg} />
        </Grid.Column>
        <Grid.Column width={12}>
          <Header as='h4'>
            <QLink to={`/u/${user.profile.name}/project/${project._id}`}>
              {project.name}
            </QLink> 
            &emsp;<small>{isOwner ? "(owner)" : "(member)"}</small>
          </Header>
          <p title="(Plays counter not yet implemented)">
            {MemberStr}&emsp;<Icon name='play' />0,000 Plays
          </p>
        </Grid.Column>
      </Grid>
    )
  })
  return retval.length > 0 ? <div>{retval}</div> : Empty
}

const UserProjects = (props) => (
  <Grid.Column width={8}>
    <Header as="h2">
      <QLink to={`/u/${props.user.profile.name}/projects`}>Owned Projects</QLink>
    </Header>
    <SomeProjects user={props.user} projects={props.projects} ownedFlag={true} />
    <Header as="h2">
      <QLink to={`/u/${props.user.profile.name}/projects`}>Member of</QLink>
    </Header>
    <SomeProjects user={props.user} projects={props.projects} ownedFlag={false} />
  </Grid.Column>
)

UserProjects.propTypes = {
  user:     PropTypes.object.isRequired,
  projects: PropTypes.array
}

export default UserProjects
