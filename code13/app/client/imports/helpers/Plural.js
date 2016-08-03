


export default Plural = {
  numStr: function(number, str, suffix="s")
  {
    return `${number} ${str}${number === 1 ? "" : suffix}`
  }
}