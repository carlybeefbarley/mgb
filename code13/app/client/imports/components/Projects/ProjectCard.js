import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import QLinkUser from '/client/imports/routes/QLinkUser'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import WorkState from '/client/imports/components/Controls/WorkState'
import { getProjectAvatarUrl } from '/imports/schemas/projects'
import { Card, Icon, Header } from 'semantic-ui-react'

// This is a Project Card which is a card-format version of the Project information.
// It is passed a project database object and it locally decides what fields to use/render within that structure.

const ProjectCard = props => {
  const { project, owner, canEdit, handleFieldChanged } = props        
  const linkTo = "/u/" + project.ownerName + "/project/" + project._id
  const MemberStr = (!project.memberIds || project.memberIds.length === 0) ? "1 Member" : (project.memberIds.length + 1) + " Members"

  return (
    <Card key={project._id} className='animated fadeIn'>

      <QLink className="image" to={linkTo} elOverride='div'>
        <ImageShowOrChange
          className="image"
          imageSrc={getProjectAvatarUrl(project)}
          canEdit={canEdit}
          canLinkToSrc={canEdit}
          handleChange={(newUrl, avatarId) => handleFieldChanged( { "avatarAssetId": avatarId }) } />
      </QLink>

      <QLink className="content" to={linkTo}>
        <Icon name='star' className="right floated" />
        <div className="header">
          {project.name}&nbsp;
          <WorkState 
              workState={project.workState} 
              popupPosition="bottom center"
              showMicro={true}
              handleChange={(newWorkState) => handleFieldChanged( { "workState": newWorkState } )}
              canEdit={canEdit}/>
        </div>
        <Card.Meta>
          <Icon name='users' />&nbsp;{MemberStr}
        </Card.Meta>

        <Card.Description>
          <b>Description:&nbsp;</b> 
          <InlineEdit
            validate={text => (text.length >= 0 && text.length < 64)}
            activeClassName="editing"
            text={project.description || "(no description)"}
            paramName="description"
            change={data => handleFieldChanged({...data})}
            isDisabled={!canEdit}
            />
        </Card.Description>
      </QLink>

      <Card.Content extra>
        <span>
          <Icon size='large' name='sitemap' />
          Project
        </span>
        <QLinkUser targetUser={owner} />
      </Card.Content>
    </Card>
  )
}

ProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  owner:   PropTypes.oneOfType([PropTypes.string, PropTypes.object]),     // Optional user object for owner. It's best to have it, but sometimes it may be expensive to go get the user record so let's not force it
  canEdit: PropTypes.bool,
  handleFieldChanged: PropTypes.func
}

export default ProjectCard