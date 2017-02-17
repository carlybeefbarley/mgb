const isChar = /[a-zA-Z]/
const isNum = /\d/
const isNotAlphanumeric = /([^a-zA-Z\d])/gi // !!!notice NOT(^) in second regex

export default (str) => {
  // strip first number or other fancy char - and replace non alphanumeric
  // this can be improved to allow some UTF-8 symbols as variables
  // pick some fancy charcode \x0001 instead of $ ?
  const stripped = str.replace(isNum, '').replace(isNotAlphanumeric, '$')
  let ret = ''
  for(let i=0; i<stripped.length; i++){
    if(stripped[i] == '$'){
      if(stripped[i + 1] == '$'){
        i++
        continue
      }
      if(stripped[i + 1] && isChar.test(stripped[i + 1])){
        ret += stripped[i + 1].toUpperCase()
      }

      i++
    }
    else{
      ret += stripped[i]
    }
  }
  return ret
}
