import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { utilPushTo } from '/client/imports/routes/QLink'
import validate from '/imports/schemas/validate'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import WorkState from '/client/imports/components/Controls/WorkState'
import { getProjectAvatarUrl } from '/client/imports/helpers/assetFetchers'
// This is a Project Card which is a card-format version of the Project information.
// It is passed a project database object and it locally decides what fields to use/render within that structure.

const ProjectCard = (props, context) => {
  const { project, canEdit, handleFieldChanged } = props
  const {
    _id,
    allowForks,
    description,
    forkChildren,
    forkParentChain,
    memberIds,
    name,
    ownerName,
    workState,
  } = project
  const linkTo = '/u/' + ownerName + '/projects/' + name
  const MemberStr = !memberIds || memberIds.length === 0 ? '1 Member' : memberIds.length + 1 + ' Members'
  const numChildForks = _.isArray(forkChildren) ? forkChildren.length : 0
  const hasParentFork = _.isArray(forkParentChain) && forkParentChain.length > 0

  return (
    <Card
      key={_id}
      // `as="div"` and `link` because `onClick` renders as an `a`
      link
      as="div"
      className="animated fadeIn mgb-projectcard-width"
      onClick={() => utilPushTo(context.urlLocation.query, linkTo)}
    >
      <Card.Content>
        <ImageShowOrChange
          imageSrc={getProjectAvatarUrl(project)}
          header="Project Avatar"
          canEdit={canEdit}
          canLinkToSrc={canEdit}
          handleChange={
            !handleFieldChanged ? (
              undefined
            ) : (
              (newUrl, avatarId) => handleFieldChanged({ avatarAssetId: avatarId })
            )
          }
        />
      </Card.Content>
      <Card.Content>
        <span style={{ float: 'right' }}>
          <WorkState
            workState={workState}
            handleChange={
              !handleFieldChanged ? (
                undefined
              ) : (
                newWorkState => handleFieldChanged({ workState: newWorkState })
              )
            }
            canEdit={canEdit}
          />
        </span>

        <Card.Header title={name} content={name} />

        <Card.Meta>
          <div>
            <Icon name="users" />
            <span>{MemberStr}</span>
          </div>
          <div style={{ color: numChildForks ? 'black' : null }}>
            <Icon name="fork" color={hasParentFork ? 'blue' : null} />
            <span style={{ color: allowForks ? 'green' : null }}>{numChildForks} Forks</span>
          </div>
        </Card.Meta>

        <Card.Description>
          <small>
            <InlineEdit
              validate={validate.projectDescription}
              activeClassName="editing"
              text={description || '(no description)'}
              paramName="description"
              change={data => handleFieldChanged({ ...data })}
              isDisabled={!canEdit}
            />
          </small>
        </Card.Description>
      </Card.Content>

      <Card.Content extra>
        <span>
          <Icon name="sitemap" />
          Project
        </span>
        <UX.UserAvatarName username={ownerName} />
      </Card.Content>
    </Card>
  )
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  handleFieldChanged: PropTypes.func,
}

ProjectCard.contextTypes = {
  urlLocation: PropTypes.object,
}

export default ProjectCard
