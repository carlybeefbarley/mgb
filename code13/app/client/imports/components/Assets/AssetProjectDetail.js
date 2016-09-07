import React, { PropTypes } from 'react'

const _propTypes = {
  projectNames:  PropTypes.array.isRequired,
  isDeleted:     PropTypes.bool.isRequired
}

const AssetProjectDetail = (props) => {
  const { projectNames, isDeleted } = props

  const inProjectClassName = "ui small basic " + (isDeleted ? "red" : "grey") + " label"
  const inProjectTitle = "Projects to which this asset belongs. " + 
                          ( isDeleted ? 
                            "(This asset is deleted. You can undelete this file from the Assets list. Use the Trashcan search filter to show deleted assets. Deleted items will be automatically purged after some number of days of non-use. Also, it is a bit weird, but we do let you edit deleted items.. why not?)" :
                            "(Currently you can only assign Assets to Projects using the 'My Assets' page.)"
                          )

  return (
    <div className={inProjectClassName} title={inProjectTitle}>
      <span>
        { isDeleted && "DELETED " }
        <i className="ui icon sitemap" />
        { (projectNames.length === 0 ? "(none)" :  projectNames.join(", ") ) }
      </span>
    </div>
  )
}

AssetProjectDetail.propTypes = _propTypes

export default AssetProjectDetail