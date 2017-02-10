import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Dropdown, Icon } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

// TODO: Handle name collisions with OTHERs' projects

const _makeCompoundProjectName = (ownerName, projectName) => (`${ownerName} : ${projectName}`)
const _renderSelectionIcon = isActive => <Icon name='sitemap' disabled={!isActive} color={isActive ? 'green' : 'grey'} />

const ProjectSelector = props => {
  const pName = props.chosenProjectName
  const { user, canEdit, availableProjects, showProjectsUserIsMemberOf, ProjectListLinkUrl, isUseCaseCreate, handleChangeSelectedProjectName } = props
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
      <Dropdown.Item 
        active={isActive} 
        value={project._id} 
        icon={ _renderSelectionIcon(isActive ) }
        key={project._id}
        text={ isOwner ? (project.name) : _makeCompoundProjectName(project.ownerName, project.name) }
        onClick={() => { handleChangeSelectedProjectName( project.name, project, _makeCompoundProjectName(project.ownerName, project.name) ) } }
        /> 
    ) // TODO: Get rid of bind in onClick() above
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
      <Dropdown.Item 
        active={isActive}
        title='Assets can optionally be placed in one or more Projects, as long as the Projects all have the same Owner'
        value="__all" 
        key="__all" 
        icon={ _renderSelectionIcon( isActive ) }
        text={`(${anyOrAll})`}
        onClick={ () => handleChangeSelectedProjectName( null, null, '')}/> 
    )
    ownedProjects.unshift( <Dropdown.Header value="__ownedHdr" key="__ownedHdr" content={`Projects owned by ${userName}`}/> )
  }
  else
    ownedProjects = <Dropdown.Item content={<small>({userName} owns no Projects yet)</small>} />

  if (memberOfProjects.length > 0)
    memberOfProjects.unshift( <Dropdown.Header value="__memberHdr" key="__memberHdr" content={`Projects ${userName} is a Member of`} /> )

  // Create the   |  In Project:  (ProjectSelect v)    |    UI        

// TODO(@levithomason): Can you make <Dropdown.Menu scrolling> work without too much 
//                      disruption? When I tried it, I could not see a scrollbar when 
//                      used in the Assets FlexPanel

  const pNameToShow = activeProjectObject ? _makeCompoundProjectName(activeProjectObject.ownerName, activeProjectObject.name) : pName
  return (
    <Dropdown 
        style={{ marginTop: '1px', marginBottom: '3px'}} // inline is compact but has no top/bottom margins
        inline
        trigger={<small>In Project: {pNameToShow || `(${anyOrAll})`}</small>} >
      <Dropdown.Menu>
        { ownedProjects }
        { showProjectsUserIsMemberOf && memberOfProjects }
        <Dropdown.Divider />
        { user &&
          <Dropdown.Item>
            <QLink className="ui item" to={ProjectListLinkUrl}>
              { canEdit ? "Manage Projects" : "View Project List" }
            </QLink>
          </Dropdown.Item>
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

ProjectSelector.propTypes = {
  canEdit:              PropTypes.bool,
  isUseCaseCreate:      PropTypes.bool,               // If yes, then say 'no project' instead of 'any project'
  user:                 PropTypes.object,             // User who we are selecting on behalf of. CAN BE NULL
  availableProjects:    PropTypes.array,              // Array of Projects for that user (owned & memberOf). See projects.js for schema. Can include owned or memberOf
  chosenProjectName:    PropTypes.string,             // null means 'all'    // TODO: Also ADD projectOWNER !!!!!!!!!!!!!
  showProjectsUserIsMemberOf:  PropTypes.bool,        // if True then also show MemberOf projects
  handleChangeSelectedProjectName: PropTypes.func.isRequired   // Callback params will be (projectName, projectOwnerId, projectOwnerName)
}

export default ProjectSelector