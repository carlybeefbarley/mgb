import _ from 'lodash'

export default validate = {

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
  }
  
}