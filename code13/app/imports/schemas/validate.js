import _ from 'lodash'

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
    return validate.lengthCap(text, 32)
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

  assetName: function(text) {
    return validate.lengthCap(text, 64)
  },

  assetDescription: function(text) {
    return validate.lengthCap(text, 120)
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
    if (value.length > 12) 
      return 'Your username is too long. The maximum length is 12 characters'
    if (value.length < 3 )
      return 'Your username is too short. It must be at least 3 characters long'
      
    return null
  }

}

export default validate