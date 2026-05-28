const { spawnSync } = require('bare-subprocess')

// Synchronous git command execution.
// Returns { code, stdout, stderr }.

function exec (repo, args) {
  let result = spawnSync('git', args, {
    cwd: repo,
    encoding: 'utf-8'
  })
  return {
    code: result.status,
    stdout: result.stdout ? result.stdout.toString().trimEnd() : '',
    stderr: result.stderr ? result.stderr.toString().trimEnd() : ''
  }
}

module.exports = exec
