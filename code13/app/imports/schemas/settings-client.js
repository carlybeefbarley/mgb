// Client-side only helper functions related to the settings table
// See also ./settings.js for context


export function getFeatureLevel(settingsObj, featureKey) {
  if (!settingsObj)
    return null

  return settingsObj._id ? settingsObj.fLevels[featureKey] : settingsObj.get(featureKey)
}


export function setFeatureLevel(settingsObj, featureKey, level) {
  if (!settingsObj)
    return

  if (getFeatureLevel(settingsObj, featureKey) !== level)
  {
    if (settingsObj._id)
      Meteor.call('Settings.setFeatureLevel', featureKey, level)
    else
      settingsObj.set(featureKey, level)    // ReactiveDict
  }          
}


export function getToolbarData(settingsObj, featureKey) {
  if (!settingsObj)
    return null
  
  if (settingsObj._id)
    return settingsObj.toolbars[featureKey]
  else
    return settingsObj.get(featureKey)
}


export function setToolbarData(settingsObj, featureKey, tdata) {
  if (!settingsObj)
    return
  
  if (settingsObj._id)
      Meteor.call('Settings.setToolbarData', featureKey, tdata)
    else
      settingsObj.set(featureKey, tdata)    // ReactiveDict
}