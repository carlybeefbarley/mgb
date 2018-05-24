const Plural = {
  numStr(number, str, suffix = 's') {
    return `${number} ${str}${number === 1 ? '' : suffix}`
  },
  numStr2(number, str, suffix = 's') {
    if (!number) {
      return ''
    }
    return `${str}${number === 1 ? '' : suffix}: `
  },
}

export default Plural
