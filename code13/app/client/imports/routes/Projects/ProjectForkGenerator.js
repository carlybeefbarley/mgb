import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Label, Icon, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const ProjectForkGenerator = ({ project, isForkPending }) => {
  const numChildren = _.isArray(project.forkChildren) ? project.forkChildren.length : 0
  const fpLen = _.isArray(project.forkParentChain) ? project.forkParentChain.length : 0
  const children = _.reverse(
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
      hoverable
      wide
      size="tiny"
      trigger={
        <Label
          basic
          id="mgbjr-project-overview-show-forks"
          color={isForkPending ? 'orange' : null}
          size="small"
          icon={{ name: 'fork', color: fpLen > 0 ? 'blue' : null }}
          content={<span style={{ color: project.allowForks ? 'green' : null }}>{numChildren}</span>}
        />
      }
      position="bottom right"
    >
      <Popup.Header>
        {numChildren ? (
          `Project has been forked ${numChildren} time${numChildren == 1 ? '' : 's'}`
        ) : (
          'This Project has never been forked'
        )}
      </Popup.Header>
      <Popup.Content>
        <Segment basic>
          Project Forks are copies of an existing Project (and all Assets in that Project) where the
          'parent-to-child' chain is tracked.
        </Segment>

        {fpLen === 0 ? (
          <div>
            <b>Originally created Content</b>
            <div>&emsp;Not forked from another Project within this system</div>
          </div>
        ) : (
          <div>
            <b>Forked from Project:</b>
            <div>
              {_.reverse(
                _.map(project.forkParentChain, (fp, idx) => (
                  <div key={fp.forkDate} style={{ paddingLeft: `${(fpLen - idx) * 4 + 4}px` }}>
                    {idx === fpLen - 1 ? '' : '...'}
                    <QLink to={`/u/${fp.parentOwnerName}`}>{fp.parentOwnerName}</QLink>
                    {' : '}
                    <QLink to={`/u/${fp.parentOwnerName}/project/${fp.parentId}`}>
                      <span style={{ color: 'blue' }}>{fp.parentProjectName}</span>
                    </QLink>
                    <small style={{ color: '#c8c8c8' }}>&ensp;{moment(fp.forkDate).fromNow()}</small>
                  </div>
                )),
              )}
            </div>
          </div>
        )}
        <div style={{ marginTop: '1em', maxHeight: '200px', overflow: 'scroll' }}>
          <b>
            <Icon name="fork" />
            {numChildren} Forks of this project:
          </b>
          {numChildren ? children : <div>&nbsp;(None yet)</div>}
        </div>
      </Popup.Content>
    </Popup>
  )
}

ProjectForkGenerator.propTypes = {
  project: PropTypes.object.isRequired,
  isForkPending: PropTypes.bool.isRequired,
}

export default ProjectForkGenerator
