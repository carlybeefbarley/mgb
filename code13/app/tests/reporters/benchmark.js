var mocha = require('mocha');
module.exports = MyReporter;

function MyReporter(runner) {
  mocha.reporters.Base.call(this, runner);
  var passes = 0;
  var failures = 0;
  let total = 0
  runner.on('pass', function(test){
    passes++;
    console.log(`pass: ${test.fullTitle()} (${test.duration}ms)`);
    total += test.duration
  });

  runner.on('fail', function(test, err){
    failures++;
    console.log(`fail: ${test.fullTitle()} (${test.duration}ms)`, err.message);
    total += test.duration
  });

  runner.on('end', function(){
    console.log(`end: ${passes}/${passes + failures} in ${total}ms`);
    process.exit(failures);
  });
}
