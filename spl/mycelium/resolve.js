const fs = require('bare-fs')
const path = require('bare-path')

// Walk the ancestor axis to find the repo root.
// Looks for .git directory — same as git itself.
function repoRoot (from) {
  let dir = path.resolve(from)
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    let parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

module.exports = { repoRoot }
