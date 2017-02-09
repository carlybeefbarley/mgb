export default (str) => {
  // strip first number or other fancy char - and replace non alphanumeric
  // this can be improved to allow some UTF-8 symbols as variables
  // pick some fancy charcode \x0001 instead of $ ?
  const stripped = str.replace(/\d/, '').replace(/([^a-zA-Z\d\s_])/gi, '$')
  let ret = ''
  for(let i=0; i<stripped.length; i++){
    if(stripped[i] == '$'){
      ret += stripped[i+1].toUpperCase()
      i++
    }
    else{
      ret += stripped[i]
    }
  }
  return ret
}
