export default (Plural = {
  numStr: function(number, str, suffix = 's') {
    return `${number} ${str}${number === 1 ? '' : suffix}`
  },
  numStr2: function(number, str, suffix = 's') {
    if (!number) {
      return ''
    }
    return `${str}${number === 1 ? '' : suffix}: `
  },
})
