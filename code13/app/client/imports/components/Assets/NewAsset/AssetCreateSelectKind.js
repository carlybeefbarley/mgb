import React, { PropTypes } from 'react'
import { AssetKinds, AssetKindKeys } from '/imports/schemas/assets'
import { doesUserHaveRole } from '/imports/schemas/roles'
import { Button, Icon } from 'semantic-ui-react'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

const AssetCreateSelectKind = React.createClass({
  propTypes: {
    onChangeAsset: PropTypes.func.isRequired, // Callback function to create the asset, and is expected to navigate to the new page.
    //   Params are (assetKindKey, newAssetNameString). The newAssetNameString can be ""
    currUser: PropTypes.object, // Currently logged in user (if any)
    selectedKind: PropTypes.string,
  },

  getInitialState: () => ({ showMoreInfo: false }),

  getDefaultProps: () => ({ selectedKind: AssetKindKeys[0] }),

  handleShowMoreLessClick() {
    const { showMoreInfo } = this.state

    this.setState({ showMoreInfo: !showMoreInfo })
    joyrideCompleteTag(`mgbjr-CT-create-asset-kindinfo-${showMoreInfo ? 'less' : 'more'}`)
  },

  render: function() {
    const { onChangeAsset, currUser, selectedKind } = this.props
    const { showMoreInfo } = this.state
    const activeAK = selectedKind ? AssetKinds[selectedKind] : null

    const ExplanationToggler = (
      <a onClick={this.handleShowMoreLessClick}>
        <span id="mgbjr-create-asset-morelesskindinfo">
          {showMoreInfo ? 'less' : 'more'}...
        </span>
      </a>
    )

    return (
      <div id="mgbjr-create-asset-select-kinds">
        {AssetKindKeys.map(k => {
          const ak = AssetKinds[k]
          const isActive = k === selectedKind
          const elemId = `mgbjr-create-asset-select-kind-${k}`
          const sty = { width: '7em', margin: '0 1em 1em 0' }
          if (ak.requiresUserRole) {
            if (!doesUserHaveRole(currUser, ak.requiresUserRole)) return null // Don't show
            if (!isActive) sty.backgroundColor = 'rgba(0,0,255,0.05)' // Blue for the special ones
          }

          return (
            <Button
              icon
              id={elemId}
              basic={!isActive}
              key={k}
              color={ak.color}
              style={sty}
              onClick={() => {
                joyrideCompleteTag(`mgbjr-CT-create-asset-select-kind-${k}`)
                onChangeAsset(k)
              }}
            >
              <Icon size="large" name={ak.icon} />
              <p style={{ marginTop: '5px' }}>
                {ak.name}
              </p>
            </Button>
          )
        })}

        {activeAK &&
          <div style={{ opacity: 0.5 }}>
            <p>
              {activeAK.description}&ensp;
              {showMoreInfo || ExplanationToggler}
            </p>
            {showMoreInfo &&
              <p>
                {activeAK.explanation} &ensp; {ExplanationToggler}
              </p>}
          </div>}
      </div>
    )
  },
})

export default AssetCreateSelectKind
