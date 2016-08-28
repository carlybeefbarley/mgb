/*
 Need to figure out how to "NOT" put describe in the "it" (probably I'm currently misusing mocha)
 Otherwise meteor will make infinite tests by every time adding new to the stack
*/
let npm, parallel, shouldRun = false;
if (typeof Meteor !== 'undefined') {
  if (Meteor.isTest) {
    npm = Npm
  }
}
else {
  npm = {require: require}
}

var assert = require('assert');

function add() {
  return Array.prototype.slice.call(arguments).reduce(function (prev, curr) {
    return prev + curr;
  }, 0);
}
describe("runnin", function () {
  it("Generating tests", function () {

    describe('add()', function () {
      var tests = [
        {args: [1, 2], expected: 3},
        {args: [1, 2, 3], expected: 6},
        {args: [1, 2, 3, 4], expected: 10}
      ];

      tests.forEach(function (test) {
        it('correctly adds ' + test.args.length + ' args', function () {
          var res = add.apply(null, test.args);
          assert.equal(res, test.expected);
        });
      });
    });
  })
})

