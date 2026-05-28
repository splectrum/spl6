const fs = require('bare-fs')
const { contextHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { resolvePath } = require('spl/mycelium/xpath/raw/uri/helpers')

// spl.mycelium.xpath.raw.remove
//
// Schema-aware raw. Full visibility. Filesystem remove.

module.exports = function remove (record) {
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
