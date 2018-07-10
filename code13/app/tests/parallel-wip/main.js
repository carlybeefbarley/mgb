const cp = require('child_process')
const fs = require('fs')
const child = cp.fork(__dirname + '/child.js', {
  stdio: [
    0, // Use parents stdin for child
    'pipe', // Pipe child's stdout to parent
    fs.openSync('err.out', 'w'), // Direct child's stderr to a file
    'ipc',
  ],
})

child.on('message', m => {
  console.log('PARENT got message:', m)
})

child.on('exit', code => {
  console.log(`child exitted with code: ${code}`)
})

child.on('stdout', m => {
  console.log('STDOUT:', m)
})
child.send({ files: ['./test.js'] })

const reportFD = fs.openSync('report.html', 'w')

child.stdout &&
  child.stdout.on('data', d => {
    fs.write(reportFD, d, 0, d.length)
    //report.write(d);
    //console.log(d.toString());
  })
