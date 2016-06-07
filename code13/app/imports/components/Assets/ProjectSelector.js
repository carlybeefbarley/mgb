import React from 'react';
import QLink from '../../routes/QLink';

export default ProjectSelector = React.createClass({
  propTypes: {
    canEdit: React.PropTypes.bool,
    user: React.PropTypes.object.isRequired,
    availableProjects: React.PropTypes.array,   // See projects.js for schema. Can include owned or memberOf
    chosenProjectName: React.PropTypes.string,  // null means 'all'
    handleChangeSelectedProjectName: React.PropTypes.func
  },
  
  renderSelectionIcon: function(isActive)
  {
    return isActive ? 
              <i className="ui green sitemap icon"></i> : 
              <i className="ui grey sitemap disabled icon"></i>
  },
  
  render: function() {
    const pName = this.props.chosenProjectName
    let choices = []
    // Build the list of 'View Project' Menu choices of OWNED projects
    _.each(this.props.availableProjects, (project) => { 
      let isActive = (project.name === pName)
      if (project.ownerId === this.props.user._id)
        choices.push( <a className={"ui item"+ (isActive ? " active" : "")} 
                        data-value={project} 
                        key={project._id} 
                        onClick={this.handleChangeSelectedProjectName.bind(this, project)}>
                        { this.renderSelectionIcon(isActive ) }
                        { project.name }
                      </a>)    
    })
    
    // TODO: Show projects that user is Member of.. Can provide the navigator for those projects at least
    
    // Add '(Any Project) if there are 1 or more projects owned by this user
    if (choices.length > 0)
    {
      let isActive = (pName === null)
      choices.unshift(
        <a  className="ui header" 
            data-value="__ownedHdr" 
            key="__ownedHdr">
            Owned projects
        </a>)
      choices.push(
        <a  className={"ui item"+ (isActive ? " active" : "")} 
            data-value="__all" 
            key="__all" 
            onClick={this.handleChangeSelectedProjectName.bind(this, null)}>
            { this.renderSelectionIcon(isActive ) }
            (Any Project)
        </a>)                
    }
    else
      choices = <div className="ui disabled item">(No projects for this user)</div>
      
    // Create the       | ProjectSelect v |      UI        
        
    return (
        <div className="ui simple dropdown item">        
          Project: {pName || "(Any Project)"}
          <i className="dropdown icon"></i>
          <div className="ui right menu simple">
            { choices }           
            <div className="divider"></div>
            <QLink className="ui item" to={this.props.ProjectListLinkUrl}>
              { this.props.canEdit ? "Manage Projects" : "View Projects" }
            </QLink>
          </div>
        </div>
    );
  },

  handleChangeSelectedProjectName: function(chosenProject)
  {
    if (this.props.handleChangeSelectedProjectName)
      this.props.handleChangeSelectedProjectName(chosenProject ? chosenProject.name : null);
  }
  
  
})
