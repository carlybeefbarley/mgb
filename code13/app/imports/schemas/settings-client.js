// Client-side only helper functions related to the settings table
// See also ./settings.js for context

import _ from 'lodash'
import SpecialGlobals from '/imports/SpecialGlobals.js'


const _getSettingType = (settingsGroupName, settingsObj, subKey) => 
{
  if (!settingsObj)
    return null

  const group = settingsObj.get(settingsGroupName)
  return group ? group[subKey] : null
}


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


const _saveSettingsNow = (settingsObj) => { 
  const asObj = _.omit(settingsObj.all(), [ '_id', 'updatedAt'])
  Meteor.call('Settings.save', asObj) 
}
const _debouncedSaveSettings = _.debounce(_saveSettingsNow, SpecialGlobals.settings.settingsSaveDebounceMs)


export function getFeatureLevel(settingsObj, featureKey) {
  return _getSettingType('fLevels', settingsObj, featureKey)
}

export function setFeatureLevel(settingsObj, featureKey, level) {
  _setSettingType('fLevels', settingsObj, featureKey, level)
}


export function getToolbarData(settingsObj, featureKey) {
  return _getSettingType('toolbars', settingsObj, featureKey)
}

export function setToolbarData(settingsObj, featureKey, tdata) {
  _setSettingType('toolbars', settingsObj, featureKey, tdata)
}