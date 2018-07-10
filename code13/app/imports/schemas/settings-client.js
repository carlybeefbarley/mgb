// Client-side only helper functions related to the settings table
// See also ./settings.js for context

import _ from 'lodash'
import SpecialGlobals from '/imports/SpecialGlobals.js'

//
// SETTINGS GROUP NAMES - FOR DATABASE keys
// ..Do NOT change these strings - they are keys into the Settings Table for feature groups
//

// Settings Group Name: Toolbar Feature Levels
const _GROUP_FEATURELEVELS = 'fLevels'

// Settings Group Name: Toolbar Re-arrangement by user
// const _GROUP_TOOLBARS      = 'toolbars' //No longer used as of Jan 2017.

// Settings Group Name: Chat Channel last-read timestamps. These match latest read Chat.[channelName].createdAt
const _GROUP_CHAT_LAST_READ_TIMESTAMP_ON_CHATCHANNELNAME = 'chatLastRead'

// Settings Group Name: Chat settings - Channel pinned ChannelNames, etc
const _GROUP_CHAT_SETTINGS = 'chatSettings'
const _GROUP_CHAT_SETTINGS_SUBKEY_PINNED_CHANNELNAMES = 'chatPinnedChannelNames'

//
// Internal helper functions
//

/**
 * Check a settings keyPart isn't going to cause hell.
 * For example it must not have a '.' in it settingsKey.
 * This doesn't return an error, it just does a console.error() so
 * we will notice during development
 */
const _validKeyRegex = /^[^.]*/
const _checkKeyIsValid = settingsKey => {
  if (!_validKeyRegex.test(settingsKey))
    console.error(`Settings client encountered invalid settingsKey '${settingsKey}'`)
}

// This can return null if there is no settings object, OR if there is no key defined yet
const _getSettingType = (settingsGroupName, settingsObj, subKey) => {
  if (!settingsObj) return null

  _checkKeyIsValid(subKey)

  const group = settingsObj.get(settingsGroupName)
  return group ? group[subKey] : null
}

const _saveSettingsNow = settingsObj => {
  const asObj = _.omit(settingsObj.all(), ['_id', 'updatedAt'])
  Meteor.call('Settings.save', asObj)
}
const _debouncedSaveSettings = _saveSettingsNow //_.debounce(_saveSettingsNow, SpecialGlobals.settings.settingsSaveDebounceMs)

const _setSettingType = (settingsGroupName, settingsObj, subKey, value) => {
  if (!settingsObj) return

  _checkKeyIsValid(subKey)

  const storedValue = _getSettingType(settingsGroupName, settingsObj, subKey)

  // Not in particular that _.isEqual is needed for reliably handling date comparisons.  See http://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
  if (!_.isEqual(storedValue, value)) {
    //console.log("DO_____SET______", settingsGroupName, subKey)
    const group = settingsObj.get(settingsGroupName) || {}
    group[subKey] = value
    settingsObj.set(settingsGroupName, group) // ReactiveDict
    if (settingsObj.keys._id) _debouncedSaveSettings(settingsObj)
  }
}

const _resetSettingsGroup = (settingsGroupName, settingsObj) => {
  if (!settingsObj) return

  console.log(`Resetting Settings Group '${settingsGroupName}' to empty object for current User `)
  settingsObj.set(settingsGroupName, {})
  if (settingsObj.keys._id) _saveSettingsNow(settingsObj)
}

//
// EXPORTS
//

// 1. Feature Levels

//
/**
 * get the feature level for this feature (typically a toolbar name, but also used for things like flexPanel)
 * @export
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {string} featureKey
 * @returns {Object} This can return null if there is no settings object, OR if there is no key defined yet
 */
export function getFeatureLevel(settingsObj, featureKey) {
  return _getSettingType(_GROUP_FEATURELEVELS, settingsObj, featureKey)
}

/**
 * get the feature level for this feature (typically a toolbar name, but also used for things like flexPanel)
 * @export
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {string} featureKey
 * @param {any} level to set toolbar at (string or can it be number?)
 * @returns {void}
 */
export function setFeatureLevel(settingsObj, featureKey, level) {
  _setSettingType(_GROUP_FEATURELEVELS, settingsObj, featureKey, level)
}

/**
 *
 * Special funtion to erase the settings group, thus reverting to defaults
 * @export
 * @param {any} settingsObj
 */
export function resetAllFeatureLevelsToDefaults(settingsObj) {
  _resetSettingsGroup(_GROUP_FEATURELEVELS, settingsObj)
}

// 2. Last read-status on various Chat channels

//
/**
 * get the feature level for this feature (typically a toolbar name, but also used for things like flexPanel)
 * @export
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {string} channelName: A channelName as created by chats.makeChannelName()
 * @returns {Object} This can return null if there is no settings object, OR if there is no key defined yet
 */
export function getLastReadTimestampForChannel(settingsObj, channelName) {
  return _getSettingType(_GROUP_CHAT_LAST_READ_TIMESTAMP_ON_CHATCHANNELNAME, settingsObj, channelName)
}

/**
 * get the feature level for this feature (typically a toolbar name, but also used for things like flexPanel)
 * @export
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {string} channelName: A channelName as created by chats.makeChannelName()
 * @param {Date} timestamp of last read message
 * @returns {void}
 */
export function setLastReadTimestampForChannel(settingsObj, channelName, timestamp) {
  _setSettingType(_GROUP_CHAT_LAST_READ_TIMESTAMP_ON_CHATCHANNELNAME, settingsObj, channelName, timestamp)
}

// 3. Asset pinning

/**
 * get the list of Pinned Channels
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @returns {Array} ordered Array of channelName strings as defined by chats.makeChannelName().
 *          This will never be null or undefined; an empty list will be []
 */
export function getPinnedChannelNames(settingsObj) {
  return (
    _getSettingType(_GROUP_CHAT_SETTINGS, settingsObj, _GROUP_CHAT_SETTINGS_SUBKEY_PINNED_CHANNELNAMES) || []
  )
}

/**
 * get the list of Pinned Channels
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {channelNamesArray} ordered Array of channelName strings as defined by
 *          chats.makeChannelName(). This list is exactly like the list returned by
 *          getPinnedChannelNames(). If the passed in value is null or undefined, an error
 *          will be logged and the setting will not be set, but there is no error value/return
 */
export function setPinnedChannelNames(settingsObj, channelNamesArray) {
  if (!_.isArray(channelNamesArray)) {
    console.error(
      'Settings: setPinnedChannelNames() encountered non-array list of channelNames',
      channelNamesArray,
    )
    return
  }

  _setSettingType(
    _GROUP_CHAT_SETTINGS,
    settingsObj,
    _GROUP_CHAT_SETTINGS_SUBKEY_PINNED_CHANNELNAMES,
    channelNamesArray,
  )
}

/**
 * Toggle on/off a pinned channelName in the pinned channelNames settings
 * @param {ReactiveDict} settingsObj - must be the global Meteor-reactive Settings object
 * @param {*} channelName. A channelName string as defined by chats.makeChannelName().
 */
export function togglePinnedChannelName(settingsObj, channelName) {
  if (!_.isString(channelName)) {
    console.error('Settings: togglePinnedChannelName() encountered non-string: ', channelName)
    return
  }
  setPinnedChannelNames(settingsObj, _.xor(getPinnedChannelNames(settingsObj), [channelName]))
}
