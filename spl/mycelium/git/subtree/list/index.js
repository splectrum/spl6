const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')

const EXEC_KEY = 'spl.mycelium.process.execute'
const RESPONSE_TYPE = 'spl.data.mycelium.git.subtree'

module.exports = function list (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.subtree.list: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let entries = git.subtrees.load(repo).map(e => {
    let urlResult = git.exec(repo, ['remote', 'get-url', e.remote])
    return {
      prefix: e.prefix,
      remote: e.remote,
      branch: e.branch,
      url: urlResult.code === 0 ? urlResult.stdout : null
    }
  })

  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: { entries },
    headers: [
      ...record.headers,
      contextHeader('spl.data.response.type', RESPONSE_TYPE),
      contextHeader('spl.status', 'completed')
    ]
  }
}
