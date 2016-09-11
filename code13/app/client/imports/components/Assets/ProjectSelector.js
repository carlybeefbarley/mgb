import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

// TODO: Handle name collisiions with OTHERs' projects

export default ProjectSelector = React.createClass({
  propTypes: {
    canEdit:              PropTypes.bool,
    user:                 PropTypes.object.isRequired,  // User who we are selecting on behalf of
    availableProjects:    PropTypes.array,              // Array of Projects for that user (owned & memberOf). See projects.js for schema. Can include owned or memberOf
    chosenProjectName:    PropTypes.string,             // null means 'all'    // TODO: Also ADD projectOWNER !!!!!!!!!!!!!
    showProjectsUserIsMemberOf:  PropTypes.bool,        // if True then also show MemberOf projects
    handleChangeSelectedProjectName: PropTypes.func.isRequired   // Callback params will be (projectName, projectOwnerId, projectOwnerName)
  },
  
  renderSelectionIcon: (isActive) => (<i className={`ui ${isActive ? "green" : "grey disabled"} sitemap icon`} />),
  makeCompoundProjectName: (ownerName, projectName) => (`${ownerName} ➟ ${projectName}`),

  render: function() {
    const pName = this.props.chosenProjectName
    const { user, canEdit, availableProjects, showProjectsUserIsMemberOf, ProjectListLinkUrl } = this.props
    let ownedProjects = []
    let memberOfProjects = []

    // Build the list of 'View Project' Menu choices of OWNED  and MEMBER projects
    _.each(availableProjects, (project) => { 
      const isActive = (project.name === pName)     // TODO: Also ADD projectOWNER !!!!!!!!!!!!!
      const isOwner = (project.ownerId === user._id)
      const entry = (
        <a  className={"ui item"+ (isActive ? " active" : "")} 
            data-value={project} 
            key={project._id} 
            onClick={this.handleChangeSelectedProjectName.bind(this, project)}>
          { this.renderSelectionIcon(isActive ) }
          { isOwner ? (project.name) : this.makeCompoundProjectName(project.ownerName, project.name) }
        </a>
        )
      if (isOwner)
        ownedProjects.push( entry )
      else if (showProjectsUserIsMemberOf)
        memberOfProjects.push( entry )
    })
    
    // Add '(Any Project) if there are 1 or more projects Owned by this user
    if (ownedProjects.length > 0)
    {
      let isActive = (pName === null)
      ownedProjects.unshift(
        <a  className={"ui item"+ (isActive ? " active" : "")} 
            title="An Asset placed in 'any project' is actually _not_ in a project, but will be shown in searches that include 'any project'"
            data-value="__all" 
            key="__all" 
            onClick={this.handleChangeSelectedProjectName.bind(this, null)}>
            { this.renderSelectionIcon(isActive ) }
            (Any Project)
        </a>)
      ownedProjects.unshift(
        <a  className="ui header"
            data-value="__ownedHdr"
            key="__ownedHdr">
            Projects owned by {user.profile.name}
        </a>)
    }
    else
      ownedProjects = <div className="ui disabled item">(No projects owned by {user.profile.name}</div>

    if (memberOfProjects.length > 0)
      memberOfProjects.unshift(
        <a  className="ui header"
            data-value="__memberHdr"
            key="__memberHdr">
            Projects {user.profile.name} is a Member of
        </a>
      )

    // Create the   |  Within Project:  (ProjectSelect v)    |    UI        

    return (
      <div className="ui simple dropdown item">        
        <small >Within Project: {pName || "(Any Project)"} </small>
        <i className="dropdown icon"></i>
        <div className="ui right menu simple">
          { ownedProjects }
          { showProjectsUserIsMemberOf && memberOfProjects }
          <div className="divider"></div>
          <QLink className="ui item" to={ProjectListLinkUrl}>
            { canEdit ? "Manage Projects" : "View Project List" }
          </QLink>
        </div>
      </div>
    )
  },

  handleChangeSelectedProjectName: function(proj)
  {
    if (proj)
      this.props.handleChangeSelectedProjectName( proj.name, proj, this.makeCompoundProjectName(proj.ownerName, proj.name) )
    else
      this.props.handleChangeSelectedProjectName( null, null, "" )
  }
})