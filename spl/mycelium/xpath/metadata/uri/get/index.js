const fs = require('bare-fs')
const { Buffer } = require('spl/mycelium/runtime')
const { contextHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { resolvePath, hasMetaSegment, isMetaName, filterMeta } = require('spl/mycelium/xpath/metadata/uri/helpers')

// spl.mycelium.xpath.metadata.uri.get
//
// Metadata lens. Shows underscore-prefixed nodes.
// Once inside a metadata subtree (path contains an
// underscore-prefixed segment), full visibility.

module.exports = function get (record) {
  let inMeta = hasMetaSegment(record.key)

  let target = resolvePath(record.headers, record.key)

  if (!target) {
    return withContext(record, [
      contextHeader('spl.error', 'get: no execution context')
    ])
  }

  if (!fs.existsSync(target)) {
    return withContext(record, [
      contextHeader('spl.error', 'get: not found — ' + record.key)
    ])
  }

  let stat = fs.statSync(target)
  let node

  if (stat.isDirectory()) {
    let entries = fs.readdirSync(target)
    if (!inMeta) entries = filterMeta(entries)
    let contents = Buffer.from(entries.join('\n'))
    node = {
      type: 'branch',
      created: Math.floor(stat.birthtimeMs),
      modified: Math.floor(stat.mtimeMs),
      value: { type: 'utf8', length: contents.length, contents }
    }
  } else {
    if (!inMeta && !isMetaName(record.key)) {
      return withContext(record, [
        contextHeader('spl.error', 'get: not found — ' + record.key)
      ])
    }
    let contents = fs.readFileSync(target)
    node = {
      type: 'leaf',
      created: Math.floor(stat.birthtimeMs),
      modified: Math.floor(stat.mtimeMs),
      value: { type: 'binary', length: contents.length, contents: Buffer.from(contents) }
    }
  }

  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: node,
    headers: [...record.headers, contextHeader('spl.status', 'completed')]
  }
}
