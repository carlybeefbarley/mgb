import PropTypes from 'prop-types'
import React from 'react'
import { AssetKinds, AssetKindKeys, safeAssetKindStringSepChar } from '/imports/schemas/assets'
import { joyrideStore } from '/client/imports/stores'
import { Icon, Menu } from 'semantic-ui-react'

// UI Component to render menus to allow asset types to be selected

const _iconStyle = { marginLeft: '1px', marginRight: '3px' }
const AssetKindsSelector = ({ showCompact, kindsActive, handleToggleKindCallback }) => {
  // Split kinds string into array for convenience
  const kindsArray = kindsActive.split(safeAssetKindStringSepChar)

  // Build the list of 'Create New Asset' Menu choices
  const choices = AssetKindKeys.map(k => {
    const active = k == kindsArray // map == ['map']
    const name = AssetKinds.getName(k)
    const color = AssetKinds.getColor(k)
    const icon = <Icon name={active ? 'checkmark box' : 'square outline'} />
    return (
      <Menu.Item
        as="a"
        active={active}
        color={color}
        id={`mgbjr-asset-search${showCompact ? '-flexPanel-' : '-'}${name.toLowerCase()}`}
        key={k}
        onClick={ev => {
          // fyi - this is a pretty simple/stateless completion tag - it's not tracking Select/unselect/multiselect.
          joyrideStore.completeTag(`mgbjr-CT-asset-search-kind-select-clicked-${k}`)
          if (handleToggleKindCallback) handleToggleKindCallback(k, ev.altKey)
        }}
      >
        <Icon
          color={active ? AssetKinds.getColor(k) : null}
          name={AssetKinds.getIconName(k)}
          style={_iconStyle}
        />
        {!showCompact && (
          <span>
            {icon} {name}
          </span>
        )}
      </Menu.Item>
    )
  })

  const compactProps = showCompact ? { widths: 9 } : { vertical: true }

  return (
    <Menu size="small" {...compactProps} fluid secondary pointing style={{ marginTop: 0 }}>
      {choices}
    </Menu>
  )
}

AssetKindsSelector.PropTypes = {
  kindsActive: PropTypes.string, // String with safeAssetKindStringSepChar- separated list of AssetKindKeys strings which are active.
  handleToggleKindCallback: PropTypes.func, // We will call this back with a string indicating which Kind to toggle. Special value "__all" means enable all
  showCompact: PropTypes.bool, // If true, show very compact
}

export default AssetKindsSelector
