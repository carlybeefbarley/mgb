module.exports = browser => {
  // this will throw exception on IE
  return () => {
    try {
      const log = browser
        .manage()
        .logs()
        .get('browser')
      return log.value
    } catch (e) {
      return []
    }
  }
}
