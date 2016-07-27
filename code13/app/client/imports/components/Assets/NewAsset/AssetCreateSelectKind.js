import _ from 'lodash';
import React, { PropTypes } from 'react';
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets';
import { doesUserHaveRole } from '/imports/schemas/roles'


export default AssetCreateSelectKind = React.createClass({
  propTypes: {
    handleSelectAsset:    PropTypes.func.isRequired,        // Callback function to create the asset, and is expected to navigate to the new page. Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:             PropTypes.object,                // currently logged in user (if any)
    selectedKind:         PropTypes.string
  },

  render: function() {
    return (
      <div className="ui items">
        { AssetKindKeys.map((k) => {
          const ak = AssetKinds[k]
          const isActive = (k === this.props.selectedKind)

          let sty = { 
            backgroundColor: (isActive ? "rgba(0,255,0,0.15)" : "rgba(0,0,0,0.04)"),        
            marginLeft: "6px", 
            marginRight: "6px", 
            marginTop: "6px", 
            marginBottom:"6px", 
            padding: "8px 8px 8px 8px"
          }
          if (ak.requiresUserRole)
          {
            if (!doesUserHaveRole(this.props.currUser, ak.requiresUserRole))
              return null // Don't show
            if (!isActive)
              sty.backgroundColor = "rgba(0,0,255,0.04)"    // Blue for the special ones 
          }

          return (
            <div className={"ui link item"} key={k} style={sty} onClick={ () => {this.props.handleSelectAsset(k)}}>
              <div className="ui mini image">
                <div className="center">
                  <i className={"huge " + ak.icon + " icon"}></i>
                </div>
              </div>
              <div className="content" >
                <div className="header">{ak.name}</div>
                <div className="description">
                  { ak.description }
                  { ak.requiresUserRole && ` (Only available to ${ak.requiresUserRole} users)`}
                  </div>
              </div>
            </div>
          )
        })
      }
      </div>
    )
  }

})