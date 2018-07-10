/*
this quick and dirty way of testing/debugging  ideas about test runners
TODO: remove this file when done
*/
let npm
// hack for meteor Npm.require
try {
  npm = Npm
} catch (e) {
  npm = { require }
}
let parallel = function(...args) {
  return describe(...args)
}

let isMeteor = false
// from this file all the magic will begin
if (typeof Meteor !== 'undefined') {
  if (Meteor.isTest) {
    run2()
  }
} else {
  // TODO: for unknown reason mocha.parallel makes Meteor server to crash after 2nd parallel test
  parallel = npm.require('mocha.parallel')
  //runTest()
  run2()
}

function run2() {
  // describe('Testing', function() {
  //   before('Locking async tests', function() {})
  //   it('Should pass', function(done) {
  //     done()
  //   })
  // })
}

function runTest() {
  describe('Setting time limit to 120 seconds', function() {
    this.timeout(120 * 1000)
    parallel('Another file: First sample test', function() {
      //
      it('will pass', function(done) {
        setTimeout(done, 2000)
      })

      it('will pass also only quicker', function(done) {
        setTimeout(done, 1000)
      })

      it('will pass also but last', function(done) {
        setTimeout(done, 3100)
      })
    })

    parallel('Another file: Second async test', function() {
      it('will pass also only quicker', function(done) {
        setTimeout(done, 1000)
      })
    })
  })
}
