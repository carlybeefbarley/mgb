import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link} from 'react-router';

// This is a compact editor for membership

export default ProjectMembershipEditor = React.createClass({
  propTypes: {
    availableProjectNamesArray: PropTypes.array,            // Array of all possible project names
    chosenProjectNames: PropTypes.array,                    // Array of chosen project names
    handleChangeChosenProjectNames: PropTypes.func,         // Will be passed a new array
    canEdit: PropTypes.bool                                 // Can be false
  },
  
  render: function() {

    const projectNames = "In projects: " + (this.props.chosenProjectNames.length === 0 ? "none" :  this.props.chosenProjectNames.join(", ") )

    if (!this.props.canEdit || !this.props.availableProjectNamesArray || this.props.availableProjectNamesArray.length === 0)
      return <div>{projectNames}</div>

    // OK, so we can edit! Let's do this!
    
    // Build the list of 'View Project' Menu choices
    let choices = this.props.availableProjectNamesArray.map((k) => { 
      let inList = _.includes(this.props.chosenProjectNames, k)
      return    <a  className={"ui item"+ (inList ? " active" : "")} 
                    data-value={k} key={k} 
                    onClick={this.handleToggleProjectName.bind(this, k)}>
                    <i className={inList ? "ui toggle on icon" : "ui toggle off icon"}></i>&nbsp;{k}
                </a>        
    })
    

    // Create the       | (edit) > |      UI
    return (
      <div>
        <i className="sitemap icon"></i> {projectNames} 
        <div className="ui simple dropdown item">        
          <i className="dropdown icon"></i>
          <div className="ui menu">
            {choices}
          </div>
        </div>
      </div>
    );
  },

  handleToggleProjectName: function(pName)
  {
    let list = this.props.chosenProjectNames;
    if (this.props.handleChangeChosenProjectNames)
    {
      let inList = _.includes(list, pName)
      this.props.handleChangeChosenProjectNames(inList ? _.without(list, pName) : _.union(list,[pName]));
    }
  }
  
})
