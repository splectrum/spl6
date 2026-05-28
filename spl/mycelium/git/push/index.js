const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')

const EXEC_KEY = 'spl.mycelium.process.execute'

module.exports = function push (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.push: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let reality = git.detectReality(repo, ctx.value.root.local)
  let result

  if (reality.mode === 'subtree') {
    result = git.subtrees.push(repo, reality.prefix)
  } else {
    result = git.push(repo)
  }

  if (result.error || result.code !== 0) {
    return withContext(record, [
      contextHeader('spl.error', 'git.push: ' + (result.error || result.stderr || 'failed'))
    ])
  }

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
