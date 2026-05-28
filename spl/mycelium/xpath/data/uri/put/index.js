const fs = require('bare-fs')
const bpath = require('bare-path')
const avro = require('avsc')
const { contextHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { resolvePath, operatorArgs, hasMetaSegment } = require('spl/mycelium/xpath/data/uri/helpers')

let inputType = null
function getInputType () {
  if (inputType) return inputType
  let def = JSON.parse(fs.readFileSync(bpath.join(__dirname, 'input.avsc'), 'utf-8'))
  let argsFields = def.fields.filter(f => f.position !== 'key')
  inputType = avro.Type.forSchema({ ...def, fields: argsFields })
  return inputType
}

module.exports = function put (record) {
  if (hasMetaSegment(record.key)) {
    return withContext(record, [
      contextHeader('spl.error', 'put: metadata path not accessible — ' + record.key)
    ])
  }

  let target = resolvePath(record.headers, record.key)

  if (!target) {
    return withContext(record, [
      contextHeader('spl.error', 'put: no execution context')
    ])
  }

  let argBytes = operatorArgs(record.headers)[0]
  if (!argBytes) {
    return withContext(record, [
      contextHeader('spl.error', 'put: no content to write')
    ])
  }

  let input
  try { input = getInputType().fromBuffer(argBytes) }
  catch (e) {
    return withContext(record, [
      contextHeader('spl.error', 'put: invalid input — ' + e.message)
    ])
  }

  let dir = bpath.dirname(target)
  fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(target, input.content)

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
