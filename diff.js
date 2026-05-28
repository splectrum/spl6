const exec = require('./exec')

// Git diff output.
// Returns { content, filesChanged, insertions, deletions }

function diff (repo, opts) {
  let args = ['diff']
  if (opts && opts.staged) args.push('--staged')
  args.push('--stat')
  if (opts && opts.path) args.push('--', opts.path)

  let stat = exec(repo, args)
  if (stat.code !== 0) {
    return { error: stat.stderr || 'git diff failed' }
  }

  // Full diff content
  let contentArgs = ['diff']
  if (opts && opts.staged) contentArgs.push('--staged')
  if (opts && opts.path) contentArgs.push('--', opts.path)

  let full = exec(repo, contentArgs)

  let filesChanged = 0
  let insertions = 0
  let deletions = 0

  if (stat.stdout) {
    let summary = stat.stdout.split('\n').pop() || ''
    let fm = summary.match(/(\d+) files? changed/)
    let im = summary.match(/(\d+) insertions?/)
    let dm = summary.match(/(\d+) deletions?/)
    if (fm) filesChanged = parseInt(fm[1], 10)
    if (im) insertions = parseInt(im[1], 10)
    if (dm) deletions = parseInt(dm[1], 10)
  }

  return {
    content: full.stdout || '',
    filesChanged,
    insertions,
    deletions
  }
}

module.exports = diff
