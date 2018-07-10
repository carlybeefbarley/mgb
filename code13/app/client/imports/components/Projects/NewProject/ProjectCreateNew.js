import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import validate from '/imports/schemas/validate'
import { Message, Icon } from 'semantic-ui-react'

// The Create Project link is always in context of a user since only a user can create a project in their account.

const ProjectCreateNew = React.createClass({
  propTypes: {
    placeholderName: PropTypes.string.isRequired, // Note that a default is provided below
    handleCreateProjectClick: PropTypes.func.isRequired, // Callback function to create the project, and is expected to navigate to the new page. Params are (projectKindKey, newProjectNameString). The newProjectNameString can be ""
    currUser: PropTypes.object, // currently logged in user (if any)
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
  },

  getDefaultProps() {
    return { placeholderName: 'name for new project..' }
  },

  getInitialState() {
    return {
      buttonActionPending: false, // True after the button has been pushed. so it doesn't get pushed twice
      newProjectName: '', // "" or a valid projectName string
    }
  },

  /**
   *
   *
   * @param {any} pName
   * @returns {Boolean}
   */
  isProjectNameInUseByCurrUser(pName) {
    const { currUser } = this.props
    if (!currUser) return false

    const cuid = this.props.currUser._id
    const exists = _.some(
      this.props.currUserProjects,
      p => p.ownerId === cuid && _.upperCase(p.name) === _.upperCase(pName),
    )
    return exists
  },

  render() {
    const { currUser } = this.props
    const newPname = this.state.newProjectName
    const inUse = this.isProjectNameInUseByCurrUser(newPname)
    const isProjectNameValid = !inUse && validate.projectName(newPname) && newPname !== ''
    const isProjectReadyToCreate = isProjectNameValid
    const chosenNameStr = isProjectNameValid ? `"${newPname}"` : ''
    const isButtonDisabled = this.state.buttonActionPending || !isProjectReadyToCreate
    const createButtonClassName = 'ui primary' + (isButtonDisabled ? ' disabled ' : ' ') + 'button'
    const createButtonTooltip = isProjectReadyToCreate
      ? 'Click here to create your new Project'
      : "You must choose a valid name for your new project. There is no 'project rename' capability yet, so try to pick a name you like :)"
    return (
      <div>
        <div id="mgbjr-project-create-new-explanation" className="ui raised segment">
          <p>
            <strong>Projects</strong> are a way to conveniently group a set of related Assets,{' '}
            <strong>and</strong> also optionally allow others to edit those Assets:
          </p>
          <ol>
            <li>
              <strong>Projects</strong> can be used as kind of 'tag' to search for Assets are part of the
              Project
            </li>
            <li>
              You can let other users be <em>members</em> of a <strong>Project</strong> you own. This allows
              them to edit assets which are part of that Project
            </li>
          </ol>
          <p>
            Note that <strong>a single Asset can be in multiple projects</strong>, so you can create a Project
            for just the parts of a game that you want to collaborate on. Think of a Project as being like a
            'tag' for your Assets, but that tag can also let Project Members edit those Assets. This 'loose'
            Project model makes it easy to collaborate on parts of a game, or to share common assets between
            games.
          </p>
        </div>

        {currUser && (
          <div className="ui padded segment" id="mgbjr-project-create-new-input-name">
            <h4 className="ui header">Enter a name for your new Project</h4>
            <div className="ui items">
              <div className={'ui fluid input' + (isProjectNameValid ? '' : ' error')}>
                <input
                  className="fluid"
                  type="text"
                  value={newPname}
                  onChange={e => this.setState({ newProjectName: e.target.value })}
                  placeholder={this.props.placeholderName}
                  ref={inp => inp && inp.focus()}
                />
              </div>
            </div>
            {inUse &&
            !this.state.buttonActionPending && (
              <p>
                <Icon name="warning sign" />&emsp;You already own a Project with that Name
              </p>
            )}
          </div>
        )}

        {currUser && (
          <div title={createButtonTooltip}>
            <div
              className={createButtonClassName}
              onClick={this.handleCreateProjectClick}
              id="mgbjr-create-new-project-button"
            >
              Create New Project {chosenNameStr}
              <i className="right chevron icon" />
            </div>
          </div>
        )}

        {!currUser && (
          <Message icon="warning sign" warning content="You must be logged in to create a Project" />
        )}
      </div>
    )
  },

  handleCreateProjectClick() {
    this.setState({ buttonActionPending: true })
    this.props.handleCreateProjectClick(this.state.newProjectName)
  },
})

export default ProjectCreateNew
