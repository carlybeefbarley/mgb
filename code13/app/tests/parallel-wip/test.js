describe('testing something', function() {
  it('passing without callback', function() {})
  describe('Failing tests', function() {
    it('passing with callback', function(done) {
      setTimeout(done, 1000)
    })
    it('making exception', function() {
      throw new Error('Gotcha')
    })
  })
})
