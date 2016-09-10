import React, { PropTypes } from 'react'
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets'
import { doesUserHaveRole } from '/imports/schemas/roles'

export default AssetCreateSelectKind = React.createClass({
  propTypes: {
    handleSelectAsset:    PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:             PropTypes.object,                // currently logged in user (if any)
    selectedKind:         PropTypes.string
  },

  render: function() {
    const { handleSelectAsset, currUser, selectedKind } = this.props
    const activeAK = selectedKind ? AssetKinds[selectedKind] : null

    return (
      <div>
        { AssetKindKeys.map((k) => {
          const ak = AssetKinds[k]
          const isActive = (k === selectedKind)
          let sty = { width: "6em", marginBottom: "4px" }
          if (ak.requiresUserRole)
          {
            if (!doesUserHaveRole(currUser, ak.requiresUserRole))
              return null // Don't show
            if (!isActive)
              sty.backgroundColor = "rgba(0,0,255,0.05)"    // Blue for the special ones 
          }

          return (
            <div className={`ui icon ${isActive && "positive"} button`} key={k} style={sty} onClick={ () => {handleSelectAsset(k)}}>
              <i className={ak.icon + " large icon"}></i>
              <p style={{ marginTop: "4px" }}>{ak.name}</p>
            </div>
          )
        })
      }
      { activeAK && <p> { activeAK.description } </p> }
      </div>
    )
  }
})