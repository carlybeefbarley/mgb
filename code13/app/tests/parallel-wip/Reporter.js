function Reporter(runner) {
  var passes = 0
  var failures = 0
  runner.on('suite', function(suite) {
    if (suite.root) {
      console.log(`<doctype html><html><head><meta charset="UTF-8" /><title>test report</title></head><body>`)
      return
    }
    console.log(`<div style="margin-left: 10px"><b>${suite.title}</b>`)
  })
  runner.on('suite end', function(suite) {
    if (suite.root) {
      return
    }
    console.log(`</div>`)
  })
  runner.on('pass', function(test) {
    passes++
    console.log(`<div style="color:green; margin-left: 10px"><p>${test.title}</p></div>`)
  })

  runner.on('fail', function(test, err) {
    failures++
    console.log(
      `<div style="color:red; margin-left: 10px"><p><div>${test.title}</div><code>${err.message}</code></p></div>`,
    )
  })

  runner.on('end', function() {
    console.log(`<div>Summary: ${passes}/${passes + failures}`)
    console.log(`</body></html>`)
    process.exit(failures)
  })
}

module.exports = Reporter
