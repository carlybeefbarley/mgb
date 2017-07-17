const runNPMCommand = require('./run-npm-command')

const isCI = process.env.CI === 'true'

const include = ['**/*.js?(on|x)']
const ignore = ['**/lib/**', '.meteor/**', '.yarn-cache/**', 'public/phaser/**']

runNPMCommand('prettier', [
  isCI ? '--list-different' : '--write',
  ...include.map(glob => `"${glob}"`),
  ...ignore.map(glob => `"!${glob}"`),
])

console.log('Linting...')
runNPMCommand('eslint', [
  !isCI && '--fix',
  ...include.map(glob => `"${glob}"`),
  ...ignore.map(glob => `--ignore-pattern "${glob}"`),
])
