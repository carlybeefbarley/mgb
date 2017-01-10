import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'

// TODO: Handle name collisiions with OTHERs' projects

export default ProjectSelector = React.createClass({
  propTypes: {
    canEdit:              PropTypes.bool,
    isUseCaseCreate:      PropTypes.bool,               // If yes, then say 'no project' instead of 'any project'
    user:                 PropTypes.object,             // User who we are selecting on behalf of. CAN BE NULL
    availableProjects:    PropTypes.array,              // Array of Projects for that user (owned & memberOf). See projects.js for schema. Can include owned or memberOf
    chosenProjectName:    PropTypes.string,             // null means 'all'    // TODO: Also ADD projectOWNER !!!!!!!!!!!!!
    showProjectsUserIsMemberOf:  PropTypes.bool,        // if True then also show MemberOf projects
    handleChangeSelectedProjectName: PropTypes.func.isRequired   // Callback params will be (projectName, projectOwnerId, projectOwnerName)
  },
  
  renderSelectionIcon: (isActive) => (<i className={`ui ${isActive ? "green" : "grey disabled"} sitemap icon`} />),
  makeCompoundProjectName: (ownerName, projectName) => (`${ownerName} ➟ ${projectName}`),

  render: function() {
    const pName = this.props.chosenProjectName
    const { user, canEdit, availableProjects, showProjectsUserIsMemberOf, ProjectListLinkUrl, isUseCaseCreate } = this.props
    let ownedProjects = []
    let memberOfProjects = []
    const userName = user ? user.profile.name : "guest"
    const anyOrAll = isUseCaseCreate ? 'No Project' : 'All Projects'
    let activeProjectObject = null

    // Build the list of 'View Project' Menu choices of OWNED and MEMBER projects
    _.each(availableProjects, (project) => { 
      const isActive = (project.name === pName) 
      if (isActive) {
        if (activeProjectObject) {
          console.error('BUG: ProjectSelector() DOES NOT YET HANDLE ProjectName collisions. Doh ')    // TODO!!! Update interface to handle userId
        }
        activeProjectObject = project
      }
      const isOwner = user && (project.ownerId === user._id)
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
      const isActive = (pName === null)
      ownedProjects.unshift(
        <a  className={"ui item"+ (isActive ? " active" : "")} 
            title='Assets can optionally be placed in one or more projects, as long as the projects all have the same Owner'
            data-value="__all" 
            key="__all" 
            onClick={this.handleChangeSelectedProjectName.bind(this, null)}>
            { this.renderSelectionIcon(isActive ) }
            ({anyOrAll})
        </a>)
      ownedProjects.unshift(
        <a  className="ui header"
            data-value="__ownedHdr"
            key="__ownedHdr">
            Projects owned by {userName}
        </a>)
    }
    else
      ownedProjects = <div className="ui disabled item">(No projects owned by {userName}</div>

    if (memberOfProjects.length > 0)
      memberOfProjects.unshift(
        <a  className="ui header"
            data-value="__memberHdr"
            key="__memberHdr">
            Projects {userName} is a Member of
        </a>
      )

    // Create the   |  In Project:  (ProjectSelect v)    |    UI        

    const pNameToShow = activeProjectObject ? this.makeCompoundProjectName(activeProjectObject.ownerName, activeProjectObject.name) : pName
    return (
      <div className="ui simple dropdown item">
        <small>In Project: {pNameToShow || `(${anyOrAll})`}</small>
        <i className="dropdown icon"></i>
        <div className="ui right menu simple">
          { ownedProjects }
          { showProjectsUserIsMemberOf && memberOfProjects }
          <div className="divider"></div>
          { user &&
            <QLink className="ui item" to={ProjectListLinkUrl}>
              { canEdit ? "Manage Projects" : "View Project List" }
            </QLink>
          }
        </div>
      </div>
    )
  },

  handleChangeSelectedProjectName: function(proj)
  {
    if (proj)
      this.props.handleChangeSelectedProjectName( proj.name, proj, this.makeCompoundProjectName(proj.ownerName, proj.name) )
    else
      this.props.handleChangeSelectedProjectName( null, null, '' )
  }
})