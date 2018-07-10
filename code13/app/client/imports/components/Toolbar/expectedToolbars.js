import _ from 'lodash'
import { AssetKinds } from '/imports/schemas/assets'

// Here is a list of *known* toolbar scope names & Max Values, default values etc.
// This is so that some Settings-style (e.g fpUxLevels.js) can enumerate them all
// and offer a global modification choice

// Values for unknown toolbars...
const _defaultTbMaxLevel = 25
const _defaultTbDefaultLevel = 1
const _defaultTbIconName = 'red help circle'

export const expectedToolbars = {
  FlexPanel: { friendlyName: 'Flex Panel', max: 8, default: 6, assetKinds: null, icon: 'ellipsis vertical' }, // Not really toolbars, but I wanted the same fpLevel stuff

  EditGraphic: {
    friendlyName: 'Graphic Editor',
    max: 10,
    default: 10,
    assetKinds: ['graphic'],
    icon: AssetKinds.getIconName('graphic'),
  },
  EditCode: {
    friendlyName: 'Code Editor',
    max: 4,
    default: 4,
    assetKinds: ['code', 'tutorial'],
    icon: AssetKinds.getIconName('code'),
  },
  MapTools: {
    friendlyName: 'Map Editor',
    max: 27,
    default: 27,
    assetKinds: ['map', 'actormap'],
    icon: AssetKinds.getIconName('map'),
  },
  AudioTools: {
    friendlyName: 'Sound/Music Editor',
    max: 25,
    default: 25,
    assetKinds: ['sound', 'music'],
    icon: AssetKinds.getIconName('sound'),
  },

  SkillsMap: { friendlyName: 'Skills Viewer', max: 1, default: 1, icon: 'plus circle' },

  PlayCodeGame: { friendlyName: 'Play Code Game Controls', max: 1, default: 1, icon: 'game' },
}

// We do this before adding functions so that the function names don't pollute the keys :)
expectedToolbars.scopeNames = _.keys(expectedToolbars)

// This is useful for UIs that don't want to show the non-tunable toolbars (i.e. those for maxLevel = 1)
expectedToolbars.scopeNamesTunable = _.keys(_.pickBy(expectedToolbars, t => t.max > 1))

// get Max Value for feature level
expectedToolbars.getMaxLevel = toolbarName => {
  const tb = expectedToolbars[toolbarName]
  if (!tb)
    console.error(
      `Unexpected getMaxLevel call for toolbarName='${toolbarName}' requested. Returning default=${_defaultTbMaxLevel}. Forgot to add your toolbar to the expectedToolbars?`,
    )
  return tb ? tb.max : _defaultTbMaxLevel
}

// get default Value for feature level
expectedToolbars.getDefaultLevel = toolbarName => {
  const tb = expectedToolbars[toolbarName]
  if (!tb)
    console.error(
      `Unexpected getDefaultLevel call for toolbarName='${toolbarName}' requested. Returning default=${_defaultTbDefaultLevel}. Forgot to add your toolbar to the expectedToolbars?`,
    )
  return tb ? tb.default : _defaultTbDefaultLevel
}

expectedToolbars.getIconName = toolbarName => {
  const tb = expectedToolbars[toolbarName]
  if (!tb)
    console.error(
      `Unexpected getIconName call for toolbarName='${toolbarName}' requested. Returning default='${_defaultTbIconName}'. Forgot to add your toolbar to the expectedToolbars?`,
    )
  return tb ? tb.icon : _defaultTbIconName
}

expectedToolbars.getFriendlyName = toolbarName => {
  const tb = expectedToolbars[toolbarName]
  if (!tb)
    console.error(
      `Unexpected getFriendlyName call for toolbarName='${toolbarName}' requested. Returning default='[${toolbarName}]'. Forgot to add your toolbar to the expectedToolbars?`,
    )
  return tb ? tb.friendlyName : `[${toolbarName}]`
}

expectedToolbars.getIsUsedForAssetKind = (toolbarName, assetKindKey) => {
  const tb = expectedToolbars[toolbarName]
  if (!tb)
    console.error(
      `Unexpected getIsUsedForAssetKind call for toolbarName='${toolbarName}' requested. Returning default=false. Forgot to add your toolbar to the expectedToolbars?`,
    )
  return !tb || !assetKindKey ? false : _.includes(tb.assetKinds, assetKindKey)
}
