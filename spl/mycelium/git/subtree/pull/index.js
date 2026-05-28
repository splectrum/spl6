const fs = require('bare-fs')
const path = require('bare-path')
const avro = require('avsc')
const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { operatorArgs } = require('spl/mycelium/xpath/raw/uri/helpers')

const EXEC_KEY = 'spl.mycelium.process.execute'

let inputType = null
function getInputType () {
  if (inputType) return inputType
  let def = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.avsc'), 'utf-8'))
  inputType = avro.Type.forSchema(def)
  return inputType
}

module.exports = function pull (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.subtree.pull: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let reality = git.detectReality(repo, ctx.value.root.local)

  let input = { prefix: null }
  let argBytes = operatorArgs(record.headers)[0]
  if (argBytes) {
    try { input = getInputType().fromBuffer(argBytes) }
    catch (e) {
      return withContext(record, [
        contextHeader('spl.error', 'git.subtree.pull: invalid input — ' + e.message)
      ])
    }
  }

  let prefix
  if (reality.mode === 'subtree') {
    prefix = reality.prefix
  } else if (input.prefix) {
    prefix = input.prefix
  } else {
    return withContext(record, [
      contextHeader('spl.error', 'git.subtree.pull: specify prefix or invoke from subtree')
    ])
  }

  let result = git.subtrees.pull(repo, prefix)

  if (result.error || result.code !== 0) {
    return withContext(record, [
      contextHeader('spl.error', 'git.subtree.pull: ' + (result.error || result.stderr || 'failed'))
    ])
  }

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
