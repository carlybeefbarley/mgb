const cp = require('child_process')
const path = require('path')
const chalk = require('chalk')

/**
 * Executes a locally installed npm command with the specified args.
 *
 * @param {string} cmd - The name of the command (i.e. eslint).
 * @param {string[]} args - Array of arguments to run the command with. Falsey values are filtered out.
 */
module.exports = (cmd, args = []) => {
  if (typeof cmd !== 'string') throw new Error('run-npm-command: `cmd` must be a string')
  if (!Array.isArray(args)) throw new Error('run-npm-command: `args` must be an array')

  const cmdPath = path.relative(process.cwd(), path.join(__dirname, 'node_modules/.bin', cmd))

  const command = [cmdPath, ...args].filter(Boolean).join(' ')

  console.log(chalk.gray(`$ ${command}`))
  cp.execSync(command, { stdio: 'inherit' })
}
