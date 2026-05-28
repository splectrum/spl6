const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')

const EXEC_KEY = 'spl.mycelium.process.execute'

module.exports = function pull (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.pull: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let reality = git.detectReality(repo, ctx.value.root.local)
  let result

  if (reality.mode === 'subtree') {
    result = git.subtrees.pull(repo, reality.prefix)
  } else {
    result = git.pull(repo)
  }

  if (result.error || result.code !== 0) {
    return withContext(record, [
      contextHeader('spl.error', 'git.pull: ' + (result.error || result.stderr || 'failed'))
    ])
  }

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
