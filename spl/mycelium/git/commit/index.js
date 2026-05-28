const fs = require('bare-fs')
const path = require('bare-path')
const avro = require('avsc')
const git = require('git')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { operatorArgs } = require('spl/mycelium/xpath/raw/uri/helpers')

const EXEC_KEY = 'spl.mycelium.process.execute'

// Input schema colocated with this handler. Cached on first use.
let inputType = null
function getInputType () {
  if (inputType) return inputType
  let def = JSON.parse(fs.readFileSync(path.join(__dirname, 'input.avsc'), 'utf-8'))
  inputType = avro.Type.forSchema(def)
  return inputType
}

module.exports = function commit (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.commit: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let argBytes = operatorArgs(record.headers)[0]
  if (!argBytes) {
    return withContext(record, [
      contextHeader('spl.error', 'git.commit: no input')
    ])
  }

  let input
  try { input = getInputType().fromBuffer(argBytes) }
  catch (e) {
    return withContext(record, [
      contextHeader('spl.error', 'git.commit: invalid input — ' + e.message)
    ])
  }

  let result = git.commit(repo, input.message)

  if (result.code !== 0) {
    return withContext(record, [
      contextHeader('spl.error', 'git.commit: ' + (result.stderr || result.stdout || 'failed'))
    ])
  }

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
