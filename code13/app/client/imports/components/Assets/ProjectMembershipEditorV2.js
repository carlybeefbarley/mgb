import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Popup, Label, Icon } from 'semantic-ui-react'
import { calculateProjectAccessRightsForAsset, getColorNameForProjectAccess, getMsgForProjectAccess } from '/imports/schemas/projects'

// This is a compact editor for membership

const ProjectMembershipSummary = (props) => {
  const { currUserId, asset, currUserProjects } = props
  if (!asset)
    return null

  const projectsTable = _.sortBy(calculateProjectAccessRightsForAsset(currUserId, asset, currUserProjects), (p) => (_.toLower(p.projectName)))
  const hasProjects = projectsTable ? projectsTable.length > 0 : false

  const projectsTableAsJsx = (    // This will be the colored text in the box. For better UX, maybe this should be a count?
    <span>
    {
      _.map(projectsTable, (p,idx) => (
        <QLink 
            to={`/u/${asset.dn_ownerName}/assets`}
            query={{project:p.projectName}}
            altTo={`/u/${asset.dn_ownerName}/projects`}
            key={idx} 
            style={{color: getColorNameForProjectAccess(p)}}>
          { p.projectName + (idx === projectsTable.length-1 ? "" : ", ") }
        </QLink>
      ))
    }
    </span>
  )

  return (
    <Label 
        size='small' 
        basic 
        color={asset.isDeleted ? 'red' : null} 
        title='Projects to which this asset belongs' style={{borderRadius: '0px'}}>
        <Icon name='sitemap' />
        { (!hasProjects ? "(none)" : projectsTableAsJsx ) }
    </Label>
  )
}


///////

// 1.   Always: Show projects that this Asset is currently part of
// 2.   Also, When assetOwner === currUser (i.e. canEdit === true)
//        a) Show assets that asset owner can also place it in
//        b) Provide ability to remove Asset from Project

const ProjectMembershipPopup = (props) => {
  const { currUserId, asset, currUserProjects, canEdit, handleToggleProjectName } = props
  if (!asset)
    return null

  const makeHdrEl = (key, msg) => (<div key={key} className="ui left aligned header"><small>{msg}</small></div>)
  const labelSty = { marginBottom: "4px" }
  let choices = []
  // If I am owner, then show all possible projects and switch state for each
  if (asset.ownerId === currUserId)
  { 
    // Current user is Asset owner, so show all possible projects and switch state for each
    choices.push( makeHdrEl('h1', "My projects with this asset"))
    _.each(_.sortBy(currUserProjects, (p) => (_.toLower(p.name))), (p,idx) => {
      const isAssetPartOfProject = _.includes(asset.projectNames, p.name)
      if (p.ownerId === currUserId)
        choices.push(
          <a  className={`ui fluid ${isAssetPartOfProject ? "green" : ""} label`} 
              style={labelSty}
              key={"MyProj"+idx} 
              onClick={ () => (canEdit && handleToggleProjectName && handleToggleProjectName(p.name)) }>
              <i className="ui sitemap icon" />
              {p.name}
              <div className="detail">
                <i className={`ui ${isAssetPartOfProject ? "black checkmark" : ""} icon`}></i>
              </div>
          </a>
        )
    })
  }
  else
  {
    // Owned by somebody else, so I can just view the status.. But for each project I could be either Member or nothing
    const projectsTable = calculateProjectAccessRightsForAsset(currUserId, asset, currUserProjects)
    const makeRow = (p, idx) => {
      choices.push (
        <QLink 
            to={`/u/${asset.dn_ownerName}/assets`}
            query={{project:p.name}}
            altTo={`/u/${asset.dn_ownerName}/projects`}
            className={"ui fluid "+ getColorNameForProjectAccess(p) + " label"} 
            style={labelSty}
            title={ getMsgForProjectAccess(p) }
            data-value={p.projectName} 
            key={(p.isCurrUserProjectMember ? "MemberOf" : "NotMyProj")+idx} >
            <i className="ui sitemap icon" />
            '{p.projectName}'
            <div className="detail">
              <i className={`ui ${p.isCurrUserProjectMember ? "black checkmark" : ""} icon`}></i>
            </div>
        </QLink>
      )
    }

    const amMember = _.filter(projectsTable, (p) => (p.isCurrUserProjectMember))
    if (amMember.length > 0)
    {
      choices.push(makeHdrEl('h1', `Member of:`))
      _.each(amMember, makeRow)
    }

    const amNotMember = _.filter(projectsTable, (p) => (!p.isCurrUserProjectMember))
    if (amNotMember.length > 0)
    {
      choices.push(makeHdrEl('h2', `Not a Member:`))
      _.each(amNotMember, makeRow)
    }

    if (amNotMember.length === 0 && amMember.length === 0)
      choices.push(makeHdrEl('h3', `Asset is not in any projects`))
    else
      choices.unshift(makeHdrEl('h0', `${asset.dn_ownerName}'s Projects containing this Asset`))
  } 

  return <div>{choices}</div>
}

export default ProjectMembershipEditorV2 = React.createClass({
  propTypes: {
    currUserId: PropTypes.string,                    // Can be null (No user logged in)
    asset:      PropTypes.object,                    // Can be null (Asset not yet loaded)
    currUserProjects: PropTypes.array,               // Projects list for currently logged in user. Can be null if current User participates in No Projects (meaning [])
    handleToggleProjectName: PropTypes.func,         // Will be passed the name of the projectName to add/remove for the owner
    canEdit: PropTypes.bool                          // Can be false
  },
  
  render: function() {
    const { currUserId, asset, currUserProjects, canEdit, handleToggleProjectName } = this.props

    return (
      <Popup
          on='hover'
          hoverable={canEdit}    // So mouse-over popup keeps it visible for Edit for example
          positioning='bottom right'
          trigger={(
            <span>  { /* This span wrap is needed it seems for a popup trigger if the trigger is a stateless function with no this. context. @levi? */}
              <ProjectMembershipSummary
                  currUserId={currUserId}
                  asset={asset}
                  currUserProjects={currUserProjects} />
              </span>
          )}>
        <ProjectMembershipPopup
            currUserId={currUserId}
            asset={asset}
            currUserProjects={currUserProjects}
            handleToggleProjectName={handleToggleProjectName}
            canEdit={canEdit} />
      </Popup>
    )
  }
})