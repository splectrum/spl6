const exec = require('./exec')

// Parse git status --porcelain=v1 output.
// Returns { branch, files: [{status, path}], clean }

function status (repo, opts) {
  let args = ['status', '--porcelain=v1', '--branch']
  if (opts && opts.path) args.push('--', opts.path)

  let result = exec(repo, args)
  if (result.code !== 0) {
    return { error: result.stderr || 'git status failed' }
  }

  let lines = result.stdout ? result.stdout.split('\n') : []
  let branch = ''
  let files = []

  for (let line of lines) {
    if (line.startsWith('## ')) {
      branch = line.slice(3).split('...')[0]
      continue
    }
    if (line.length < 4) continue
    files.push({
      status: line.slice(0, 2).trim(),
      path: line.slice(3)
    })
  }

  return { branch, files, clean: files.length === 0 }
}

module.exports = status
