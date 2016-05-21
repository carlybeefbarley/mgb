import React from 'react';
import {Link} from 'react-router';

export default ProjectSelector = React.createClass({
  propTypes: {
    canEdit: React.PropTypes.bool,
    availableProjectNamesArray: React.PropTypes.array,
    chosenProjectName: React.PropTypes.string,
    handleChangeSelectedProjectName: React.PropTypes.func,
    handleCreateNewProject: React.PropTypes.func
  },
  
  render: function() {
        let pName = this.props.chosenProjectName

    
    // Build the list of 'View Project' Menu choices
    let choices = this.props.availableProjectNamesArray.map((k) => { 
      let isActive = k===pName
      return    <a  className={"ui item"+ (isActive ? " active" : "")} 
                    data-value={k} key={k} 
                    onClick={this.handleChangeSelectedProjectName.bind(this, k)}>
                    { isActive ? 
                        <i className="ui checkmark icon"></i>
                      : <i className="ui square outline disabled icon"></i>
                    }
                    View assets in project "{k}"
                </a>        
    })
    if (choices.length > 0)
    {
      let isActive = (pName === null)
      choices.push(<a className={"ui item"+ (isActive ? " active" : "")} 
                    data-value="__all" key="__all" 
                    onClick={this.handleChangeSelectedProjectName.bind(this, null)}>
                    { isActive ? 
                        <i className="ui checkmark icon"></i>
                      : <i className="ui square outline disabled icon"></i>
                    }
                    View assets in all projects
                </a>)
    }

    // Create the       | ProjectSelect v |      UI
        
        
    return (
        <div className="ui simple dropdown item">        
          Project: {pName || "(all projects)"}
          <i className="dropdown icon"></i>
          <div className="ui right menu simple">
            {choices.length > 0 ? choices : <div className="ui item">"No projects defined for this user"</div>}
            { !this.props.canEdit ? null : 
            <div className="ui item">
              <div className="ui action input">
                <div className="ui small secondary button" onClick={this.handleNewProject}>Create</div>
                <input type="text" ref="newProjectName" placeholder="New Project Name" />
              </div>   
            </div>
            }
          </div>
        </div>
    );
  },

  handleChangeSelectedProjectName: function(chosenProjectName)
  {
    if (this.props.handleChangeSelectedProjectName)
      this.props.handleChangeSelectedProjectName(chosenProjectName);
  },
  
  handleNewProject: function()
  {
    let pname = this.refs.newProjectName.value
    if (!pname || pname.length < 1)
    {
      console.log("TODO: Project name too short")
      return
    }
    
    if (this.props.handleCreateNewProject)
    {
      this.props.handleCreateNewProject(pname);   
      this.refs.newProjectName.value = "";
    }
  }
 
  
})
