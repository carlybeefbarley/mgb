const runNPMCommand = require('./run-npm-command')

const isCI = process.env.CI === 'true'

const include = ['**/*.js?(on|x)']
const ignore = ['**/lib/**', '.meteor/**', '.yarn-cache/**', 'public/phaser/**']
try {
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
} catch (e) {
  // TODO: @levithomason fix this somehow.. seems meteor startup gets wrong path in the runNPMCommand
  console.log('Meteor build sideffect', e)
}
