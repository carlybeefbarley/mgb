import React, { PropTypes } from 'react'
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets'
import { doesUserHaveRole } from '/imports/schemas/roles'
import { Button, Icon } from 'semantic-ui-react'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'


export default AssetCreateSelectKind = React.createClass({
  propTypes: {
    handleSelectAsset:    PropTypes.func.isRequired,    // Callback function to create the asset, and is expected to navigate to the new page. 
                                                        //   Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser:             PropTypes.object,             // Currently logged in user (if any)
    selectedKind:         PropTypes.string
  },

  getInitialState: () => ({ showMoreInfo: false}),

  render: function() {
    const { handleSelectAsset, currUser, selectedKind } = this.props
    const { showMoreInfo } = this.state
    const activeAK = selectedKind ? AssetKinds[selectedKind] : null

    const ExplanationToggler = (
      <a 
          onClick={ () => {
            this.setState( { showMoreInfo: !showMoreInfo } )
            joyrideCompleteTag(`mgbjr-CT-create-asset-kindinfo-${showMoreInfo ? 'less' : 'more'}`)
          }}>
        <small id='mgbjr-create-asset-morelesskindinfo'>
          { showMoreInfo ? 'less...' : 'more...' }
        </small>
      </a>
    )

    return (
      <div id='mgbjr-create-asset-select-kinds'>
        { AssetKindKeys.map((k) => {
          const ak = AssetKinds[k]
          const isActive = (k === selectedKind)
          const elemId=`mgbjr-create-asset-select-kind-${k}`
          let sty = { width: "6em", marginBottom: "4px" }
          if (ak.requiresUserRole)
          {
            if (!doesUserHaveRole(currUser, ak.requiresUserRole))
              return null // Don't show
            if (!isActive)
              sty.backgroundColor = "rgba(0,0,255,0.05)"    // Blue for the special ones 
          }

          return (
            <Button icon 
                id={elemId}
                basic={!isActive}
                key={k} 
                color={ak.color}
                style={sty} 
                onClick={ () => { 
                  joyrideCompleteTag(`mgbjr-CT-create-asset-select-kind-${k}`)
                  handleSelectAsset(k)
                } }>
              <Icon size='large' name={ak.icon}  />
              <p style={{ marginTop: "5px" }}>{ak.name}</p>
            </Button>
          )
        })
      }

      { activeAK && (
        <div>
          <p> 
            { activeAK.description }&ensp;
            { showMoreInfo || ExplanationToggler }           
          </p>
          { showMoreInfo &&  
            <p>
              <em>
                { activeAK.explanation } &ensp; { ExplanationToggler } 
              </em>
            </p>
          }
        </div>
      )}
      
      </div>
    )
  }
})
