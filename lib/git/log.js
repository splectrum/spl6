const exec = require('./exec')

// Parse git log output.
// Returns [{ hash, author, timestamp, message }]

const SEP = '---GIT-LOG-SEP---'
const FORMAT = ['%H', '%an', '%at', '%s'].join(SEP)

function log (repo, opts) {
  let count = (opts && opts.count) || 10
  let args = ['log', '--format=' + FORMAT, '-n', String(count)]
  if (opts && opts.path) args.push('--', opts.path)

  let result = exec(repo, args)
  if (result.code !== 0) {
    return { error: result.stderr || 'git log failed' }
  }

  if (!result.stdout) return []

  return result.stdout.split('\n').filter(Boolean).map(line => {
    let parts = line.split(SEP)
    return {
      hash: parts[0],
      author: parts[1],
      timestamp: parseInt(parts[2], 10) * 1000,
      message: parts[3]
    }
  })
}

module.exports = log
