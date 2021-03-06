import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown, Icon, Menu } from 'semantic-ui-react'

// This is a compact editor for deciding if an Asset is in one or more projects.
// It is an earlier version of ProjectMembershipEditorv2 but with a slightly different
// use case and I (dgolds) haven't got around to merging them yet

// TODO: Also rename so it is less confusing. This isn't users-who-are-project-members...
//       This control is for asset add/remove to project

export default class ProjectMembershipEditor extends React.Component {
  static propTypes = {
    availableProjectNamesArray: PropTypes.array, // Array of all possible project names
    chosenProjectNames: PropTypes.array, // Array of chosen project names
    handleChangeChosenProjectNames: PropTypes.func, // Will be passed a new array
    canEdit: PropTypes.bool, // Can be false if read-only
  }

  render() {
    const { canEdit, chosenProjectNames, availableProjectNamesArray } = this.props
    const projectNames =
      'In projects: ' + (chosenProjectNames.length === 0 ? 'none' : chosenProjectNames.join(', '))

    if (!canEdit || !availableProjectNamesArray || availableProjectNamesArray.length === 0)
      return (
        <div>
          <Icon name="sitemap" /> {projectNames}
        </div>
      )

    // OK, so we can edit! Let's do this! ...  Create the  | (edit) > |      UI
    return (
      <div>
        <Dropdown
          item
          simple
          trigger={
            <span>
              <Icon name="sitemap" /> {projectNames}
            </span>
          }
          options={availableProjectNamesArray.map(k => {
            const inList = _.includes(chosenProjectNames, k)
            return {
              active: inList,
              key: k,
              value: k,
              text: k,
              onClick: () => this.handleToggleProjectName(k),
              icon: inList ? 'toggle on' : 'toggle off',
            }
          })}
        />
      </div>
    )
  }

  handleToggleProjectName = pName => {
    if (this.props.handleChangeChosenProjectNames)
      this.props.handleChangeChosenProjectNames(_.xor(this.props.chosenProjectNames, [pName]))
  }
}
