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

module.exports = function add (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'git.add: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  let argBytes = operatorArgs(record.headers)[0]
  let input = { paths: '.' }
  if (argBytes) {
    try { input = getInputType().fromBuffer(argBytes) }
    catch (e) {
      return withContext(record, [
        contextHeader('spl.error', 'git.add: invalid input — ' + e.message)
      ])
    }
  }

  let result = git.add(repo, input.paths.split(/\s+/).filter(Boolean))

  if (result.code !== 0) {
    return withContext(record, [
      contextHeader('spl.error', 'git.add: ' + (result.stderr || 'failed'))
    ])
  }

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
