module.exports = () => {
  describe('Testing errors: ', function() {
    // all action should be in the "it" block
    it('Should fail randomly', function(done) {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          throw new Error('Expected Error!')
        }
        done()
      }, Math.random() * 1000)
    })
  })
}
