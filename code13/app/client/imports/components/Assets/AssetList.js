import React, { PropTypes } from 'react'
import AssetCard from './AssetCard'
import { Card } from 'semantic-ui-react'
import { isSameUserId } from '/imports/schemas/users'

const AssetList = ( { currUser, assets, ...rest }) => (
  <Card.Group>
    {
      assets.map((asset) => (
        <AssetCard
          canEdit={currUser && isSameUserId(asset.ownerId, currUser._id) }
          currUser={currUser}
          asset={asset}
          key={asset._id}
          showEditButton={true} 
          {...rest}/>
      ))
    }
  </Card.Group>
)

AssetList.propTypes = {
  assets:         PropTypes.array.isRequired,
  ownersProjects: PropTypes.array,            // Project array for Asset Owner - only makes sense if the assets all belong to same user (and should only be set by caller in this case). If provided, pass to AssetCard
  fluid:          PropTypes.bool,             // If true then these are fluid (full width) card. 
  currUser:       PropTypes.object,           // currently Logged In user (not always provided)
  canEdit:        PropTypes.bool,             // Can be false
  renderView:     PropTypes.string,           // One of null/undefined  OR  one of the keys of AssetCard.assetViewChoices
  allowDrag:      PropTypes.bool.isRequired   // True if drag is allowed
}

export default AssetList