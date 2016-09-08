import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { calculateProjectAccessRightsForAsset, getColorNameForProjectAccess } from '/imports/schemas/projects'

const _propTypes = {
  currUserId:         PropTypes.string,              // Can be null (No user logged in)
  asset:              PropTypes.object,              // Can be null (Asset not yet loaded)
  currUserProjects:   PropTypes.array                // Projects list for currently logged in user. Can be null if current User participates in No Projects (meaning [])
}

const AssetProjectDetail = (props) => {
  const { currUserId, asset, currUserProjects } = props
  if (!asset)
    return null

  const projectsTable = calculateProjectAccessRightsForAsset(currUserId, asset, currUserProjects)
  const hasProjects = projectsTable ? projectsTable.length > 0 : false

  const projectsTableAsJsx = (    // This will be the colored text in the box. For better UX, maybe this should be a count?
    <span>
    {
      _.map(projectsTable, (p,idx) => (
        <span key={idx} style={{color: getColorNameForProjectAccess(p)}}>
          { p.projectName + (idx === projectsTable.length-1 ? "" : ", ") }
        </span>
      ))
    }
    </span>
  )

  const projectsMenuAsJsxArray = projectsTable.map( (p,idx) => (
    <QLink to={"/u/" + asset.dn_ownerName + "/projects/"} className={"ui small " + getColorNameForProjectAccess(p) + " basic label item"} key={idx}>
      {p.projectName}
      {p.isCurrUserProjectMember ? <small> (member)</small> : ""}
      {p.isCurrUserProjectOwner ? <small> (owner)</small> : ""}
      {(!p.isCurrUserProjectOwner && !p.isCurrUserProjectMember) ? <small> (no access)</small> : ""}
    </QLink>
  ))

  const inProjectClassName = (
    "ui simple dropdown small basic " + 
    (asset.isDeleted ? "red " : "grey ") + 
    (hasProjects ? "pointing below " : " ") + 
    " label item"
  )

  const inProjectTitle = "Projects to which this asset belongs. " + 
    ( asset.isDeleted ? 
      "(This asset is deleted. You can undelete this file from the Assets list. Use the Trashcan search filter to show deleted assets. Deleted items will be automatically purged after some number of days of non-use. Also, it is a bit weird, but we do let you edit deleted items.. why not?)" :
      "(Currently you can only assign Assets to Projects using the 'My Assets' page.)"
    )

  return (
    <div className={inProjectClassName} title={inProjectTitle}>
      <span>
        { asset.isDeleted && "DELETED " }
        <i className="ui icon sitemap" />
        { (!hasProjects ? "(none)" : projectsTableAsJsx ) }
      </span>
      { hasProjects && 
        <div className="ui small menu">
          { projectsMenuAsJsxArray }
        </div>
      }
    </div>
  )
}

AssetProjectDetail.propTypes = _propTypes

export default AssetProjectDetail