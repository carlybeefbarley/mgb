import _ from 'lodash';
import React, { PropTypes } from 'react';
import QLinkUser from '/client/imports/routes/QLinkUser';
import QLink, { utilPushTo } from '/client/imports/routes/QLink';
import validate from '/imports/schemas/validate';
import InlineEdit from '/client/imports/components/Controls/InlineEdit';
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange';
import WorkState from '/client/imports/components/Controls/WorkState';
import { getProjectAvatarUrl } from '/client/imports/helpers/assetFetchers';
import { Card, Icon } from 'semantic-ui-react';

// This is a Project Card which is a card-format version of the Project information.
// It is passed a project database object and it locally decides what fields to use/render within that structure.

const ProjectCard = props => {
  const { project, canEdit, handleFieldChanged } = props;
  const linkTo = '/u/' + project.ownerName + '/project/' + project._id;
  const MemberStr = !project.memberIds || project.memberIds.length === 0
    ? '1 Member'
    : project.memberIds.length + 1 + ' Members';
  const numChildForks = _.isArray(project.forkChildren) ? project.forkChildren.length : 0;
  const hasParentFork = _.isArray(project.forkParentChain) && project.forkParentChain.length > 0;

  return (
    <Card key={project._id} className="animated fadeIn" onClick={() => utilPushTo(window.location.query, linkTo)}>

      <ImageShowOrChange
        className="image"
        imageSrc={getProjectAvatarUrl(project)}
        header='Project Avatar'
        canEdit={canEdit}
        canLinkToSrc={canEdit}
        handleChange={(newUrl, avatarId) => handleFieldChanged({ avatarAssetId: avatarId })}
      />

      <Card.Content>
        <span style={{ float: 'right' }}>
          <WorkState
            workState={project.workState}
            handleChange={newWorkState => handleFieldChanged({ workState: newWorkState })}
            canEdit={canEdit}
          />
        </span>

        <Card.Header content={project.name} style={{ marginRight: '2em', overflowWrap: 'break-word' }} />

        <Card.Meta>
          <div>
            <Icon name="users" />
            <span>{MemberStr}</span>
          </div>
          <div style={{ color: numChildForks ? 'black' : null }}>
            <Icon name="fork" color={hasParentFork ? 'blue' : null} />
            <span style={{ color: project.allowForks ? 'green' : null }}>{numChildForks} Forks</span>
          </div>
        </Card.Meta>

        <Card.Description>
          <small>
            <InlineEdit
              validate={validate.projectDescription}
              activeClassName="editing"
              text={project.description || '(no description)'}
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
        <QLinkUser userName={project.ownerName} userId={project.ownerId} />
      </Card.Content>
    </Card>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  handleFieldChanged: PropTypes.func
};

export default ProjectCard;
