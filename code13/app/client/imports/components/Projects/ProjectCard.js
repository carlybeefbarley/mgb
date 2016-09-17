import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'
import QLink from '/client/imports/routes/QLink'
import QLinkUser from '/client/imports/routes/QLinkUser'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import WorkState from '/client/imports/components/Controls/WorkState'
import { getProjectAvatarUrl } from '/imports/schemas/projects'


// This is a Project Card which is a card-format version of the Project information.
// It is passed a project database object and it locally decides what fields to use/render within that structure.


export default ProjectCard = React.createClass({
  propTypes : {
    project: PropTypes.object.isRequired,
    owner: PropTypes.object,                 // Optional user object for owner. It's best to have it, but sometimes it may be expensive to go get the user record so let's not force it
    canEdit: PropTypes.bool,
    handleFieldChanged: PropTypes.func
  },  
  
  
  fieldChanged: function(data) {
    // data = { description: "New validated text comes here" }
    // Update your model from here    
    if (this.props.handleFieldChanged)
      this.props.handleFieldChanged({...data})
  },


  customValidateText: function(text) {
    // TODO more safety content checks here
    return (text.length >= 0 && text.length < 64);
  },

  render: function() {
    const { project, owner, wholeCardIsLink, canEdit } = this.props        
    const createdAt = project.createdAt
    const editsDisabled = !this.props.canEdit
    const projectAvatarImageUrl = (project.avatarAssetId.length && project.avatarAssetId.length && project.avatarAssetId.length > 0) ? `/api/asset/png/${project.avatarAssetId}` : "/images/wireframe/image.png"
    const linkTo = "/u/" + project.ownerName + "/project/" + project._id
    const MemberStr = (!project.memberIds || project.memberIds.length === 0) ? "1 Member" : (project.memberIds.length + 1) + " Members"

    return (
       <div className="ui bordered card" key={project._id}>

        <QLink className="image" to={linkTo}>
          <ImageShowOrChange
            className="image"
            imageSrc={projectAvatarImageUrl}
            canEdit={canEdit}
            canLinkToSrc={canEdit}
            handleChange={(newUrl, avatarId) => this.props.handleFieldChanged( { "avatarAssetId": avatarId }) } />
        </QLink>

        <QLink className="content" to={linkTo}>
          <i className="right floated star icon"></i>
          <div className="header">
            {project.name}&nbsp;
            <WorkState 
                workState={project.workState} 
                popupPosition="bottom center"
                showMicro={true}
                handleChange={(newWorkState) => this.props.handleFieldChanged( { "workState": newWorkState } )}
                canEdit={canEdit}/>
          </div>
          <div className="meta"><i className="users icon"></i>&nbsp;{MemberStr}</div>

          <div className="ui description">
            <b>Description:&nbsp;</b> 
            <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={project.description || "(no description)"}
              paramName="description"
              change={this.fieldChanged}
              isDisabled={editsDisabled}
              />
          </div>
        </QLink>

        <div className="extra content">
          <span className="left floated icon">
            <i className="large sitemap icon"></i>
            Project
          </span>
          <QLinkUser targetUser={owner} />
        </div>
      </div>
    )
  }
})