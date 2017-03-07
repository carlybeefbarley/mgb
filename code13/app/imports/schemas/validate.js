import _ from 'lodash'

const _maxUsernameLength = 12
const _minUsernameLength = 3

const _maxAssetNameLength = 64

// Valid ASSET name regex
// The REALLY important ones to exclude are
//    :   since we use that as a namespace delimeter
//    #   since...?
//    ?   since...?
const _validAssetNameRegex = /^[a-zA-Z0-9_\-. \(\)\!\/\~\;\'\<\>\@\&]*$/


// Valid PROJECT name regex
const _validProjectNameRegex = /^[a-zA-Z0-9_\-. \(\)\&']*$/
// This is a little tighter than Asset Name since it seems it can be..

var _listInvalidChars = (text, StringAllowedRegex) => (
  _.uniq(_.filter(text, c => ( !StringAllowedRegex.test(c) ) ) )
)

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

  lengthCap: function (text, lengthCap) {
    return _.isString(text) && text.length <= lengthCap
  },

  mgb1name: function (text) {
    // TODO more safety content checks here
    return validate.lengthCap(text, 16)
  },

  userName: function (text) {
    return validate.lengthCap(text, _maxUsernameLength) && text.length >= _minUsernameLength
  },

  userBio: function (text) {
    return validate.lengthCap(text, 64)
  },

  userTitle: function (text) {
    return validate.lengthCap(text, 64)
  },

  userFocusMsg: function (text) {
    return validate.lengthCap(text, 64)
  },

  projectName: function (text) {  // Note that we have a reserved projectName '_' for "No project"
    return validate.lengthCap(text, 64) && text.length > 1 && _validProjectNameRegex.test(text)
  },

  projectDescription: function(text) {
    return validate.lengthCap(text, 120)
  },

  assetName: function(text) {
    return validate.lengthCap(text, _maxAssetNameLength) && _validAssetNameRegex.test(text)
  },

  assetDescription: function(text) {
    return validate.lengthCap(text, 120)
  },

  assetNameWithReason: function(text) { 
    const isValid = validate.assetName(text)
    if (isValid)
      return null
    // else return some error string

    if (text.length > _maxAssetNameLength)
      return `That Asset name is too long. The maximum length is ${_maxAssetNameLength} characters`

    if (text.length > _maxAssetNameLength)
      return `That Asset name is too long. The maximum length is ${_maxAssetNameLength} characters`

    if (!_validAssetNameRegex.test(text))
      return `That Asset name contains invalid characters... ${_listInvalidChars(text,_validAssetNameRegex).join(' ')}`

    return 'That Asset name is not valid'  // Catch-all
  },

  // These functions return null for ok, or a string with a reason why they fail
  passwordWithReason: function (text) {
    if (!text || text.length < 6)
      return 'Your password must be at least 6 characters long'
    if (text.search(/[a-z]/i) < 0)
      return 'Your password must contain at least one letter'
    if (text.search(/[0-9]/) < 0)
      return ('Your password must contain at least 1 number')

    return null
  },

  emailWithReason: function (text) {
    if (text.search(/[^\s@]+@[^\s@]+\.[^\s@]+/) < 0)
      return 'Doesn\'t look like a valid email'
    
    return null
  },
  
  usernameWithReason: function (value) {
    if (value.search(/^[A-Za-z0-9_]+$/) < 0) 
      return 'Only letters, digits and underscores are allowed in usernames'
    if (value.length > _maxUsernameLength) 
      return `Your username is too long. The maximum length is ${_maxUsernameLength} characters`
    if (value.length < _minUsernameLength )
      return `Your username is too short. It must be at least ${_minUsernameLength} characters long`
      
    return null
  }

}

export default validate