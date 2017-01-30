import _ from 'lodash'
import React, { PropTypes } from 'react'
import { AssetKinds, AssetKindKeys, safeAssetKindStringSepChar } from '/imports/schemas/assets'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { Icon, Menu } from 'semantic-ui-react'

// UI Component to render menus to allow asset types to be selected

const AssetKindsSelector = ( { showCompact, kindsActive, handleToggleKindCallback } ) => {
  const baseSty = showCompact ? { padding: '3px 4px 3px 5px'} : {}

  // Split kinds string into array for convenience
  const kindsArray = kindsActive.split(safeAssetKindStringSepChar)

  // Build the list of 'Create New Asset' Menu choices
  const choices = AssetKindKeys.map((k) => {
    const active = _.includes(kindsArray, k)   // if k is in kindsActive then it is shown as active
    const sty = active ? {} : { color: "#bbb"}
    const name = AssetKinds.getName(k)
    const color = AssetKinds.getColor(k)
    const icon = <Icon name={active ? 'checkmark box' : 'square outline'} />
    return (
      <Menu.Item 
          as='a' 
          active={active} 
          color={color}
          id={`mgbjr-asset-search${showCompact ? '-flexPanel-':'-'}${name.toLowerCase()}`}
          key={k}
          style={ _.merge(sty, baseSty) }
          onClick={ (ev) => {
            // fyi - this is a pretty simple/stateless completion tag - it's not tracking Select/unselect/multiselect.
            joyrideCompleteTag(`mgbjr-CT-asset-search-kind-select-clicked-${k}`)
            if (handleToggleKindCallback)
              handleToggleKindCallback(k, ev.altKey)
          }} >
        <Icon color={AssetKinds.getColor(k)} name={AssetKinds.getIconName(k)} />
        { !showCompact && <span>{icon} {name}</span> }
      </Menu.Item>
    )
  })

  return (
    <Menu className={showCompact ? 'small compact' : 'small secondary vertical'}>
      {choices}
    </Menu>
  )
}

AssetKindsSelector.PropTypes = {
  kindsActive:              PropTypes.string, // String with safeAssetKindStringSepChar- separated list of AssetKindKeys strings which are active.
  handleToggleKindCallback: PropTypes.func,   // We will call this back with a string indicating which Kind to toggle. Special value "__all" means enable all
  showCompact:              PropTypes.bool    // If true, show very compact
}

export default AssetKindsSelector