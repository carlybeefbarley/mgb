import React, { PropTypes } from 'react'

// The Create Project link is always in context of a user since only a user can create a project in their account. 

export default ProjectCreateNew = React.createClass({
  propTypes: {
    placeholderName:          PropTypes.string.isRequired,      // Note that a default is provided below 
    handleCreateProjectClick: PropTypes.func.isRequired,        // Callback function to create the project, and is expected to navigate to the new page. Params are (projectKindKey, newProjectNameString). The newProjectNameString can be ""
    currUser:                 PropTypes.object                  // currently logged in user (if any)
  },


  getDefaultProps: function () {
    return { placeholderName: 'name for new project..' }
  },



  getInitialState: function () {
    return { 
      buttonActionPending: false,     // True after the button has been pushed. so it doesn't get pushed twice
      newProjectName: ""                // "" or a valid projectName string
    }
  },


  render: function() {
    const { currUser } = this.props
    const isProjectNameValid = (this.state.newProjectName !== "")   // TODO - some checks for crazy characters
    const isProjectReadyToCreate = isProjectNameValid
    const chosenNameStr = isProjectNameValid ? `"${this.state.newProjectName}"` : ""
    const isButtonDisabled = this.state.buttonActionPending || !isProjectReadyToCreate
    const createButtonClassName = "ui primary" + (isButtonDisabled ? " disabled " : " ") + "button"
    const createButtonTooltip = isProjectReadyToCreate ? "Click here to create your new Project" : "You must choose a valid name for your new project. There is no 'project rename' capability yet, so try to pick a name you like :)"
    
    return (
      <div>
        <p><em>Projects</em> are a way to group a set of related assets, and allow other people to also edit those assets directly:</p>
        <ol>
          <li>Projects can be used as kind of 'tag' to search for assets, chats etc that are part of the project</li>
          <li>You can let other users be members of your projects. This allows them to also edit assets which are part of that project</li>
        </ol>
        <p>
          Note that a single asset can be in multiple projects, so you can create a project for just the parts of a game that you want to collaborate on. 
          A project is kind of like a 'tag' for your assets, but that tag can also grant write access to those assets.
        </p>
        <p></p>

        <div className="ui padded segment">
          <h4 className="ui header">Enter a name for your new Project</h4>
          <div className="ui items">
            <div className={"ui fluid input" + (isProjectNameValid ? "" : " error")}>
              <input className="fluid" type="text" value={this.state.newProjectName} onChange={(e) => this.setState({ newProjectName: e.target.value})} placeholder={this.props.placeholderName} ref={inp => (inp && inp.focus())}></input>
            </div>
          </div>
        </div>

        <div title={createButtonTooltip}>
          <div className={createButtonClassName} onClick={this.handleCreateProjectClick} >
            Create New Project {chosenNameStr}
            <i className="right chevron icon"></i>
          </div>
        </div>

      </div>
    )
  },


  handleCreateProjectClick: function()
  {
    this.setState( { buttonActionPending: true})
    this.props.handleCreateProjectClick(this.state.newProjectName)
  }

})