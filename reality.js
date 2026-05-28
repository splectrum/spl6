const subtrees = require('./subtrees')

// Detect which reality the caller is in.
// Compares local root against registered subtree prefixes.
//
// Returns:
//   { mode: 'repo' }
//   { mode: 'subtree', prefix, remote, branch }

function detectReality (repo, localRoot) {
  let local = localRoot.replace(/^\//, '')
  if (!local) return { mode: 'repo' }

  let entries = subtrees.load(repo)
  for (let entry of entries) {
    if (local === entry.prefix || local.startsWith(entry.prefix + '/')) {
      return {
        mode: 'subtree',
        prefix: entry.prefix,
        remote: entry.remote,
        branch: entry.branch
      }
    }
  }

  return { mode: 'repo' }
}

module.exports = detectReality
