import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Card, Grid, Header, Segment } from 'semantic-ui-react'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import QLink from '/client/imports/routes/QLink'

const Empty = <Segment basic >No projects</Segment>

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = { clear: 'both', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', marginBottom: '1em' }

const SomeProjects = ( { user, projects, width,  ownedFlag, wrap, hdr } ) => {
  const comps = _.compact(projects.map( p => {
    const isOwner = (p.ownerId === user._id)
    return (isOwner !== ownedFlag) ? null : (
      <ProjectCard project={p} canEdit={false} key={p._id} />
    )
  }))

  return (
    <Grid.Row width={width}>
      <Header as="h2">
        <QLink to={`/u/${user.profile.name}/projects`}>{hdr} <small>({comps.length})</small></QLink>
      </Header>
      <Card.Group style={wrap ? _wrapStyle : _nowrapStyle}>
        { comps.length ? comps : Empty }
      </Card.Group>
    </Grid.Row>
  )
}

const _variants = [
  { ownedFlag: true,  hdr: 'Owned Projects'},
  { ownedFlag: false, hdr: 'Project Memberships'},
]

const UserProjects = ( props ) => (
  <Grid.Column width={props.width}>
    { _.map( _variants, v => ( <SomeProjects key={v.hdr} {...props} {...v}/> ))  }
  </Grid.Column>
)

UserProjects.propTypes = {
  user:     PropTypes.object.isRequired,
  projects: PropTypes.array,
  width:    PropTypes.number
}

export default UserProjects