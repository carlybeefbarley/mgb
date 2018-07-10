module.exports = browser => {
  return done => {
    try {
      browser
        .manage()
        .logs()
        .get('browser')
        .then(logs => {
          const errors = logs.filter(l => l.message.startsWith('javascript'))
          if (errors.length) {
            console.log('JS errors:', errors)
            throw new Error('Javascript errors encountered')
          }
          done && done()
        })
    } catch (e) {
      // this will throw exception on IE
      done && done()
      return []
    }
  }
}
