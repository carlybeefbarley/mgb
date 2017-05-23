import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon } from 'semantic-ui-react'

// This is a compact editor for deciding if an Asset is in one or more projects. 
// It is an earlier version of ProjectMembershipEditorv2 but with a slightly different 
// use case and I (dgolds) haven't got around to merging them yet

// TODO: Also rename so it is less confusing. This isn't users-who-are-project-members... 
//       This control is for asset add/remove to project

export default ProjectMembershipEditor = React.createClass({
  propTypes: {
    availableProjectNamesArray: PropTypes.array,            // Array of all possible project names
    chosenProjectNames: PropTypes.array,                    // Array of chosen project names
    handleChangeChosenProjectNames: PropTypes.func,         // Will be passed a new array
    canEdit: PropTypes.bool                                 // Can be false
  },
  
  render: function() {

    const { canEdit, chosenProjectNames, availableProjectNamesArray } = this.props
    const projectNames = "In projects: " + (chosenProjectNames.length === 0 ? "none" : chosenProjectNames.join(", ") )

    if (!canEdit || !availableProjectNamesArray || availableProjectNamesArray.length === 0)
      return (
        <div>
          <Icon name="sitemap"/> {projectNames}
        </div>
      )

    // OK, so we can edit! Let's do this!
    
    // Build the list of 'View Project' Menu choices
    let choices = availableProjectNamesArray.map((k) => { 
      let inList = _.includes(chosenProjectNames, k)
      return (
        <a  className={"ui item"+ (inList ? " active" : "")} 
            data-value={k} key={k} 
            onClick={this.handleToggleProjectName.bind(this, k)}>
            <Icon name={inList ? 'toggle on' : 'toggle off'} />&nbsp;{k}
        </a>
      )
    })
    

    // Create the       | (edit) > |      UI
    return (
      <div>
        <Icon name="sitemap"/> {projectNames} 
        <div className="ui simple dropdown item">
          <Icon name='dropdown'/>
          <div className="ui menu">
            {choices}
          </div>
        </div>
      </div>
    )
  },

  handleToggleProjectName: function(pName)
  {
    const list = this.props.chosenProjectNames
    if (this.props.handleChangeChosenProjectNames)
    {
      const inList = _.includes(list, pName)
      this.props.handleChangeChosenProjectNames(inList ? _.without(list, pName) : _.union(list,[pName]))
    }
  }
  
})
