const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')

const EXEC_KEY = 'spl.mycelium.process.execute'
const RESPONSE_TYPE = 'spl.data.mycelium.git.diff'

module.exports = function diff (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.diff: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let reality = git.detectReality(repo, ctx.value.root.local)
  let path = reality.mode === 'subtree' ? reality.prefix : null
  let result = git.diff(repo, { path })

  if (result.error) {
    return withContext(record, [
      contextHeader('spl.error', 'git.diff: ' + result.error)
    ])
  }

  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: result,
    headers: [
      ...record.headers,
      contextHeader('spl.data.response.type', RESPONSE_TYPE),
      contextHeader('spl.status', 'completed')
    ]
  }
}
