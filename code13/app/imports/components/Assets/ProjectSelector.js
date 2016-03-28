import React from 'react';
import {Link} from 'react-router';

export default ProjectSelector = React.createClass({
  propTypes: {
    availableProjectNamesArray: React.PropTypes.array,
    chosenProjectName: React.PropTypes.string,
    handleChangeSelectedProjectName: React.PropTypes.func,
    handleCreateNewProject: React.PropTypes.func
  },
  
  render: function() {
    // Build the list of 'View Project' Menu choices
    let choices = this.props.availableProjectNamesArray.map((k) => { 
      return    <a  className={"ui item"+ (k===this.props.chosenProjectName ? " active" : "")} 
                    data-value={k} key={k} 
                    onClick={this.handleChangeSelectedProjectName.bind(this, k)}>
                    View assets in project "{k}"
                </a>        
    })

    // Create the       | ProjectSelect v |      UI
        
    let pName = this.props.chosenProjectName
        
    return (
      <div>
        Viewing assets in {pName ? `project "${pName}"` : "all projects"}
        <div className="ui simple dropdown item">        
          <i className="dropdown icon"></i>
          <div className="ui menu">
            <div className="ui item">
              {choices}
            </div>
            <div className="ui item">
              <div className="ui action input">
                <input type="text" ref="newProjectName" placeholder="New Project Name" />
                <div className="ui button" onClick={this.handleNewProject}>Create</div>
              </div>   
            </div>
          </div>
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
