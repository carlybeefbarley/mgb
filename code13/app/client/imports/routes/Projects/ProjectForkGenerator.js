import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Divider, Header, Icon, Popup } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'

const ProjectForkGenerator = ({ project, isForkPending, ...rest }) => {
  const numChildren = _.isArray(project.forkChildren) ? project.forkChildren.length : 0
  const fpLen = _.isArray(project.forkParentChain) ? project.forkParentChain.length : 0

  const forkParents = _.reverse(
    _.map(project.forkParentChain, (fp, idx) => (
      <div key={fp.forkDate}>
        {idx === fpLen - 1 ? '' : '...'}
        <QLink to={`/u/${fp.parentOwnerName}`}>{fp.parentOwnerName}</QLink>
        {' : '}
        <QLink to={`/u/${fp.parentOwnerName}/project/${fp.parentId}`}>
          <span style={{ color: 'blue' }}>{fp.parentProjectName}</span>
        </QLink>
        <small style={{ color: '#c8c8c8' }}>&ensp;{moment(fp.forkDate).fromNow()}</small>
      </div>
    )),
  )

  const forkChildren = _.reverse(
    _.map(project.forkChildren, f => {
      const ago = moment(f.forkDate).fromNow() // It's just a popup, so no need to make it reactive
      return (
        <div key={f.projectId}>
          &nbsp;<QLink to={`/u/${f.forkedByUserName}`}>{f.forkedByUserName}</QLink>
          {' : '}
          <QLink to={`/u/${f.forkedByUserName}/project/${f.projectId}`}>
            <small style={{ color: 'blue' }}>{f.projectId}</small>
          </QLink>
          <small style={{ color: '#c8c8c8' }}>&ensp;{ago}</small>
        </div>
      )
    }),
  )

  return (
    <Popup
      wide
      hoverable
      closeOnTriggerClick
      position="right center"
      trigger={
        <Button
          {...rest}
          color={isForkPending ? 'orange' : null}
          icon="fork"
          content={`Fork (${numChildren})`}
        />
      }
    >
      <Popup.Content>
        {fpLen !== 0 ? (
          <div style={{ marginBottom: '1em' }}>
            <Header sub>Forked from</Header>
            {forkParents}
          </div>
        ) : (
          <div style={{ marginBottom: '1em' }}>
            <Header sub>This is an original Parent project</Header>
          </div>
        )}

        {!_.isEmpty(project.forkChildren) && (
          <div style={{ marginBottom: '1em' }}>
            <Header sub>Child forks</Header>
            {forkChildren}
          </div>
        )}

        <Divider />

        <p style={{ opacity: 0.5 }}>
          <Icon name="help" fitted circular /> Forking copies a Project and its Assets.
        </p>
      </Popup.Content>
    </Popup>
  )
}

ProjectForkGenerator.propTypes = {
  project: PropTypes.object.isRequired,
  isForkPending: PropTypes.bool.isRequired,
}

export default ProjectForkGenerator
