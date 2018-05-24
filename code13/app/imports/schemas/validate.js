import _ from 'lodash'
const _maxUsernameLength = 12
const _minUsernameLength = 3

const _maxAssetNameLength = 64
const _minAssetNameLength = 1

// Valid ASSET name regex
// The REALLY important ones to exclude are
//    :   since we use that as a namespace delimiter (e.g. api/asset/tutorial/username:assetname)
//    /   since it is used as an alternate asset Id format internally for some APIs (makeExpireThumbnailLink etc)
//    #   since... it is used to denote graphic frame number in Actor Editor
//    ?   since... this could look string on a URI using our /api/asset/png/USERNAME/ASSETNAME?frame=4
//                 URL format and would be a bit confusing / bug-prone when escaped
//    {   since... we may want the option to have assetName-based apis that could instead have a
//                 richer JSON-encoded data instead
//    *   since it is just going to make wild card search stupidly annoying
const _validAssetNameRegex = /^[a-zA-Z0-9_\-. ()!~;'<>@&]*$/

// Valid PROJECT name regex
const _validProjectNameRegex = /^[a-zA-Z0-9_\-. ()&']*$/
// This is a little tighter than Asset Name since it seems it can be..

const _listInvalidChars = (text, StringAllowedRegex) =>
  _.uniq(_.filter(text, c => !StringAllowedRegex.test(c)))

// Note that this allows leading/trailing spaces, even though we trim them on
// create or rename

/* handy thing to try in Meteor Shell to look for non-compliant asset (etc) names

  // Check for invalid ASSET names
  var a=require('/imports/schemas').Azzets
  var _validAssetNameRegex = /^[a-zA-Z0-9_\-. \(\)\!\/\~\;\\<\>\@\&']*$/
  a.find( { "name": { "$not":  _validAssetNameRegex }, isDeleted: false }, { fields: { name: 1} }).fetch()


  // Check for invalid PROJECT names
  var p=require('/imports/schemas').Projects
  var
  p.find( { "name": { "$not":  _validProjectNameRegex } }, { fields: { name: 1 } }).fetch()

*/

// These functions return true for ok
const validate = {
  lengthCap(text, lengthCap) {
    return _.isString(text) && text.length <= lengthCap
  },

  mgb1name(text) {
    // TODO more safety content checks here ... should allow    name1
    return validate.lengthCap(text, 64) // 64 since can have comma-separated
  },

  mgb1names(text) {
    // TODO more safety content checks here ... should allow    name1,name2,name3
    return validate.lengthCap(text, 32)
  },

  userName(text) {
    return validate.lengthCap(text, _maxUsernameLength) && text.length >= _minUsernameLength
  },

  userBio(text) {
    return validate.lengthCap(text, 64)
  },

  userTitle(text) {
    return validate.lengthCap(text, 64)
  },

  userFocusMsg(text) {
    return validate.lengthCap(text, 64)
  },

  projectName(text) {
    // Note that we have a reserved projectName '_' for "No project"
    return validate.lengthCap(text, 64) && text.length > 1 && _validProjectNameRegex.test(text)
  },

  projectDescription(text) {
    return validate.lengthCap(text, 120)
  },

  assetName(text) {
    return (
      text.length >= _minAssetNameLength &&
      validate.lengthCap(text, _maxAssetNameLength) &&
      _validAssetNameRegex.test(text)
    )
  },

  assetDescription(text) {
    return validate.lengthCap(text, 120)
  },

  assetNameWithReason(text) {
    if (text.length > _maxAssetNameLength)
      return `That Asset name is too long. The maximum length is ${_maxAssetNameLength} characters.`

    if (text.length < _minAssetNameLength)
      return `That Asset name is too short. The minimum length is ${_minAssetNameLength} characters.`

    if (!_validAssetNameRegex.test(text))
      return `That Asset name contains invalid characters: ${_listInvalidChars(
        text,
        _validAssetNameRegex,
      ).join(' ')}.`

    return null
  },

  // These functions return null for ok, or a string with a reason why they fail
  passwordWithReason(text) {
    if (!text || text.length < 6) return 'Your password must be at least 6 characters long.'
    if (text.search(/[a-z]/i) < 0) return 'Your password must contain at least one letter.'
    if (text.search(/[0-9]/) < 0) return 'Your password must contain at least 1 number.'

    return null
  },

  emailWithReason(text) {
    if (!text || !/\S+@\S+\.\S+/.test(text)) return "Doesn't look like a valid email."

    return null
  },

  usernameWithReason(value) {
    if (/([^\w]|_)/.test(value)) return 'Only letters and digits are allowed in usernames.'
    if (value.length > _maxUsernameLength)
      return `Your username is too long. The maximum length is ${_maxUsernameLength} characters.`
    if (value.length < _minUsernameLength)
      return `Your username is too short. It must be at least ${_minUsernameLength} characters.`

    return null
  },

  notEmpty(value) {
    return !!(value + '')
  },
}

export default validate
