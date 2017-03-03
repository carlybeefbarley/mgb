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
  const { project, owner, canEdit, handleFieldChanged } = props;
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
            <span>{numChildForks} Forks</span>
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
        <QLinkUser targetUser={owner} />
      </Card.Content>
    </Card>
  );
};

ProjectCard.propTypes = {
  // Optional user object for owner. It's best to have it, but sometimes it may be
  // expensive to go get the user record so let's not force it
  owner: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  project: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  handleFieldChanged: PropTypes.func
};

export default ProjectCard;
