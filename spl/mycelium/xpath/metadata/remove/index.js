const fs = require('bare-fs')
const { contextHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { resolvePath, hasMetaSegment, isMetaName } = require('spl/mycelium/xpath/metadata/uri/helpers')

// spl.mycelium.xpath.metadata.remove
//
// Schema-aware metadata. Only remove metadata paths.

module.exports = function remove (record) {
  if (!hasMetaSegment(record.key) && !isMetaName(record.key)) {
    return withContext(record, [
      contextHeader('spl.error', 'remove: not a metadata path — ' + record.key)
    ])
  }

  let target = resolvePath(record.headers, record.key)

  if (!target) {
    return withContext(record, [
      contextHeader('spl.error', 'remove: no execution context')
    ])
  }

  if (!fs.existsSync(target)) {
    return withContext(record, [
      contextHeader('spl.error', 'remove: not found — ' + record.key)
    ])
  }

  let stat = fs.statSync(target)
  if (stat.isFile()) fs.unlinkSync(target)
  else if (stat.isDirectory()) fs.rmdirSync(target, { recursive: true })

  return withContext(record, [
    contextHeader('spl.status', 'completed')
  ])
}
