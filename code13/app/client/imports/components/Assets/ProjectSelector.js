import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown, Icon } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

export const _NO_PROJECT_PROJNAME = '_'
const _NO_PROJECT_LABELTXT = 'Not in a Project'
const _NO_PROJECT_MITEMTXT = '(in no project)'

const _ANY_PROJECT_PROJNAME = null // Needs to be null otherwise default URL queries are weird
const _ANY_PROJECT_LABELTXT = 'In any Project'
const _ANY_PROJECT_MITEMTXT = '(in any project)'

const _makeCompoundProjectName = (ownerName, projectName) => `${ownerName} : ${projectName}`
const _renderSelectionIcon = isActive => (
  <Icon name="sitemap" disabled={!isActive} color={isActive ? 'green' : 'grey'} />
)
const _makeProjectNameLabelToShow = (activeProjectObject, propProjectName) => {
  if (activeProjectObject)
    return _makeCompoundProjectName(activeProjectObject.ownerName, activeProjectObject.name)
  if (propProjectName == _NO_PROJECT_PROJNAME) return _NO_PROJECT_LABELTXT
  if (propProjectName == _ANY_PROJECT_PROJNAME) return _ANY_PROJECT_LABELTXT
  // handle case of some other value we really don't expect to be possible
  return 'UnknownProjectName'
}

const _isSameProject = (chosenProjectObj, chosenProjectName, candidateProjectObj) => {
  if (chosenProjectObj) return chosenProjectObj._id === candidateProjectObj._id
  return chosenProjectName === candidateProjectObj.name
}

const ProjectSelector = ({
  id,
  user,
  canEdit,
  availableProjects,
  showProjectsUserIsMemberOf,
  ProjectListLinkUrl,
  isUseCaseCreate,
  chosenProjectObj,
  chosenProjectName,
  handleChangeSelectedProjectName,
}) => {
  const ownedProjects = []
  const memberOfProjects = []
  const userName = user ? user.profile.name : 'guest'
  let NameMatchedProjectObject = null // This is for the less-good use of this Component that just uses projectNames, and not objects

  ownedProjects.push(<Dropdown.Header key="__ownedHeader" content={`Projects owned by ${userName}`} />)

  // Always show the 'No Project' scenario
  const isSelectionForNoProject = !chosenProjectObj && chosenProjectName === _NO_PROJECT_PROJNAME
  ownedProjects.push(
    <Dropdown.Item
      active={isSelectionForNoProject}
      key="__none"
      icon={_renderSelectionIcon(isSelectionForNoProject)}
      text={_NO_PROJECT_MITEMTXT}
      onClick={() => handleChangeSelectedProjectName(_NO_PROJECT_PROJNAME, null, null)}
    />,
  )

  // when isUseCaseCreate==false (i.e. this is the view-filter scenario) show special option for "ANY Project"
  if (!isUseCaseCreate) {
    // Show "Any Project" if this is being used as  a Game/Asset view selector
    const isSelectionForAnyProject = !chosenProjectObj && chosenProjectName === _ANY_PROJECT_PROJNAME
    ownedProjects.push(
      <Dropdown.Item
        active={isSelectionForAnyProject}
        key="__all"
        icon={_renderSelectionIcon(isSelectionForAnyProject)}
        text={_ANY_PROJECT_MITEMTXT}
        onClick={() => handleChangeSelectedProjectName(_ANY_PROJECT_PROJNAME, null, null)}
      />,
    )
  }

  //if (ownedProjects.length === 0)
  //   ownedProjects.push( <Dropdown.Item content={<small>({userName} owns no Projects yet)</small>}/> )

  // Build the list of 'View Project' Menu choices of OWNED and MEMBER projects
  _.each(_.sortBy(availableProjects, ap => -ap.createdAt), project => {
    const isActive = _isSameProject(chosenProjectObj, chosenProjectName, project)
    if (isActive && !chosenProjectObj) {
      if (NameMatchedProjectObject) {
        throw new Error(
          'ProjectSelector() cannot handle ProjectName collisions when used with the projectName Interface. Check calling Element',
        )
      }
      NameMatchedProjectObject = project
    }
    const isOwner = user && project.ownerId === user._id
    const entry = (
      <Dropdown.Item
        active={isActive}
        value={project._id}
        icon={_renderSelectionIcon(isActive)}
        key={project._id}
        text={isOwner ? project.name : _makeCompoundProjectName(project.ownerName, project.name)}
        onClick={() => {
          handleChangeSelectedProjectName(
            project.name,
            project,
            _makeCompoundProjectName(project.ownerName, project.name),
          )
        }}
      />
    ) // TODO: Get rid of bind in onClick() above
    if (isOwner) ownedProjects.push(entry)
    else if (showProjectsUserIsMemberOf) memberOfProjects.push(entry)
  })

  // Prepend a header to the member-of list if it is non-empty
  if (memberOfProjects.length > 0)
    memberOfProjects.unshift(
      <Dropdown.Header key="__memberHeader" content={`Projects ${userName} is a Member of`} />,
    )

  // Create the   |  In Project:  (ProjectSelect v)    |    UI
  const actualProjectObj = chosenProjectObj || NameMatchedProjectObject
  const projectLabelNameToShow = _makeProjectNameLabelToShow(
    actualProjectObj,
    isUseCaseCreate ? _NO_PROJECT_PROJNAME : chosenProjectName,
  )
  return (
    <Dropdown
      id={id}
      style={{ marginTop: '1px', marginBottom: '3px' }} // inline is compact but has no top/bottom margins
      inline
      trigger={
        <span>
          <QLink
            to={
              actualProjectObj ? (
                `/u/${actualProjectObj.ownerName}/projects/${actualProjectObj.name}`
              ) : (
                `/u/${userName}/projects`
              )
            }
          >
            <Icon color="grey" name="sitemap" />
          </QLink>
          {projectLabelNameToShow}&ensp;
        </span>
      }
    >
      <Dropdown.Menu>
        {ownedProjects}
        {showProjectsUserIsMemberOf && memberOfProjects}
        <Dropdown.Divider />
        {user && (
          <Dropdown.Item>
            <QLink className="ui item" to={ProjectListLinkUrl}>
              {canEdit ? 'Manage Projects' : 'View Project List'}
            </QLink>
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

ProjectSelector.propTypes = {
  showProjectsUserIsMemberOf: PropTypes.bool, // if True then also show MemberOf projects
  canEdit: PropTypes.bool, // If true, then also offer a 'Manage Projects'
  user: PropTypes.object, // User who we are selecting on behalf of. CAN BE NULL
  availableProjects: PropTypes.array, // Array of Projects for that user (owned & memberOf). See projects.js for schema. Can include owned or memberOf
  chosenProjectObj: PropTypes.object, // If provided, we use this instead of chosenProjectName. If null, we use the string
  chosenProjectName: PropTypes.string, // null means 'IN NO PROJECT";  if isUseCaseCreate===true, '' means "In Any Project"
  isUseCaseCreate: PropTypes.bool.isRequired, // If yes, then say 'no project' instead of 'any project'. Also, see notes below

  // Callback params will be (projectName, projObj, projectCompoundName)
  // When isUseCaseCreate===true,
  //    'Create In No project' is indicated by { projectName: null, projObj: null, projectCompoundName: null }
  // When isUseCaseCreate===false,
  //    'Assets in No project' is indicated by { projectName: null, projObj: null,  projectCompoundName: null }
  // ** 'Look in ALL projects' is indicated by { projectName: '',   projObj: null,  projectCompoundName: ''   }

  handleChangeSelectedProjectName: PropTypes.func.isRequired,
}

ProjectSelector.NO_PROJECT_PROJNAME = _NO_PROJECT_PROJNAME
ProjectSelector.ANY_PROJECT_PROJNAME = _ANY_PROJECT_PROJNAME

export default ProjectSelector
