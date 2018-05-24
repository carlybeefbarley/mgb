import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Grid, Header } from 'semantic-ui-react'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import QLink from '/client/imports/routes/QLink'

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = {
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
  marginBottom: '1em',
}

const SomeProjects = ({ user, projects, width, ownedFlag, wrap, header }) => {
  const comps = _.compact(
    projects.map(p => {
      const isOwner = p.ownerId === user._id
      return isOwner !== ownedFlag ? null : <ProjectCard project={p} canEdit={false} key={p._id} />
    }),
  )

  if (comps.length === 0) return null

  return (
    <Grid.Row width={width}>
      <Header as="h2">
        <QLink to={`/u/${user.profile.name}/projects`}>
          {header} <small>({comps.length})</small>
        </QLink>
      </Header>
      <Card.Group style={wrap ? _wrapStyle : _nowrapStyle}>{comps}</Card.Group>
    </Grid.Row>
  )
}

const _variants = [
  { ownedFlag: true, header: 'Owned Projects' },
  { ownedFlag: false, header: 'Project Memberships' },
]

const UserProjects = props =>
  !props.projects || props.projects.length === 0 ? null : (
    <Grid.Column width={props.width}>
      {_.map(_variants, v => <SomeProjects key={v.header} {...props} {...v} />)}
    </Grid.Column>
  )

UserProjects.propTypes = {
  user: PropTypes.object.isRequired,
  projects: PropTypes.array,
  width: PropTypes.number,
}

export default UserProjects
