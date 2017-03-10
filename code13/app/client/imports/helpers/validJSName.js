const isLetter = /[a-zA-Z]/
const isNum = /^\d*/
const isNotAlphanumeric = /([^a-zA-Z\d])/gi // !!!notice NOT(^)

export default (str) => {
  // strip first number or other fancy char - and replace non alphanumeric
  // this can be improved to allow some UTF-8 symbols as variables
  // pick some fancy charcode \x0001 instead of $ ?
  const stripped = str.replace(isNum, '').replace(isNotAlphanumeric, '$')
  let ret = ''
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] == '$') {
      i++
      if (stripped[i] == '$')
        continue

      if (stripped[i] && isLetter.test(stripped[i]))
        ret += stripped[i].toUpperCase()
      else
        ret += stripped[i] // number
    }
    else
      ret += stripped[i]
  }
  return ret
}
