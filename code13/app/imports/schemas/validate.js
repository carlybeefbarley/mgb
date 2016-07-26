




export default validate = {

  lengthCap: function (text, lengthCap) {
    return (text && text.length && text.length >= 0 && text.length < lengthCap)
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
  }
  
}