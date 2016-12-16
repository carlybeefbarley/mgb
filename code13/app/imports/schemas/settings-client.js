// Client-side only helper functions related to the settings table
// See also ./settings.js for context

import _ from 'lodash'
import SpecialGlobals from '/imports/SpecialGlobals.js'

// Do not chnage these strings - they are keys into the Settings for feature groups
const _GROUP_FEATURELEVELS = 'fLevels'
const _GROUP_TOOLBARS      = 'toolbars'

// This can return null if there is no settings object, OR if there is no key defined yet
const _getSettingType = (settingsGroupName, settingsObj, subKey) => 
{
  if (!settingsObj)
    return null

  const group = settingsObj.get(settingsGroupName)
  return group ? group[subKey] : null
}

const _saveSettingsNow = (settingsObj) => { 
  const asObj = _.omit(settingsObj.all(), [ '_id', 'updatedAt'])
  Meteor.call('Settings.save', asObj) 
}
const _debouncedSaveSettings = _.debounce(_saveSettingsNow, SpecialGlobals.settings.settingsSaveDebounceMs)

const _setSettingType = (settingsGroupName, settingsObj, subKey, value) => 
{
  if (!settingsObj)
    return

  // const group = settingsObj.get(settingsGroupName)
  // return group ? group[subKey] : null

  if (_getSettingType(settingsGroupName, settingsObj, subKey) !== value)
  {
    const group = settingsObj.get(settingsGroupName) || {}
    group[subKey] = value
    settingsObj.set(settingsGroupName, group)    // ReactiveDict
    if (settingsObj.keys._id)
      _debouncedSaveSettings(settingsObj)      
  }
}

const _resetSettingsGroup = (settingsGroupName, settingsObj) => {
  if (!settingsObj)
    return

  console.log(`Resetting Settings Group '${settingsGroupName}' to empty object for current User `)
  settingsObj.set(settingsGroupName, {})
  if (settingsObj.keys._id)
    _saveSettingsNow(settingsObj)
}

// EXPORTS
// This can return null if there is no settings object, OR if there is no key defined yet
export function getFeatureLevel(settingsObj, featureKey) {
  return _getSettingType(_GROUP_FEATURELEVELS, settingsObj, featureKey)
}

export function setFeatureLevel(settingsObj, featureKey, level) {
  _setSettingType(_GROUP_FEATURELEVELS, settingsObj, featureKey, level)
}

export function resetAllFeatureLevelsToDefaults(settingsObj) {
  _resetSettingsGroup(_GROUP_FEATURELEVELS, settingsObj)
}

export function getToolbarData(settingsObj, featureKey) {
  return _getSettingType(_GROUP_TOOLBARS, settingsObj, featureKey)
}

export function setToolbarData(settingsObj, featureKey, tdata) {
  _setSettingType(_GROUP_TOOLBARS, settingsObj, featureKey, tdata)
}