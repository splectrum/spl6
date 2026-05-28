const fs = require('bare-fs')
const { Buffer } = require('spl/mycelium/runtime')
const { contextHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')
const { resolvePath, hasMetaSegment, filterData } = require('spl/mycelium/xpath/data/uri/helpers')
const { resolveType, schemaFor, findBoundary, decodeFile, navigateObject, inFileNode } = require('spl/mycelium/xpath/helpers')

// spl.mycelium.xpath.data.get
//
// Schema-aware data. Hides underscore-prefixed nodes +
// schema resolution and into-file navigation.

module.exports = function get (record) {
  if (hasMetaSegment(record.key)) {
    return withContext(record, [
      contextHeader('spl.error', 'get: not found — ' + record.key)
    ])
  }

  let target = resolvePath(record.headers, record.key)

  if (!target) {
    return withContext(record, [
      contextHeader('spl.error', 'get: no execution context')
    ])
  }

  if (fs.existsSync(target)) {
    let stat = fs.statSync(target)

    if (stat.isDirectory()) {
      let entries = filterData(fs.readdirSync(target))
      let contents = Buffer.from(entries.join('\n'))
      return result(record, {
        type: 'branch',
        created: Math.floor(stat.birthtimeMs),
        modified: Math.floor(stat.mtimeMs),
        value: { type: 'utf8', length: contents.length, contents }
      })
    }

    let type = resolveType(record.key)
    let contents = fs.readFileSync(target)
    return result(record, {
      type: 'leaf',
      created: Math.floor(stat.birthtimeMs),
      modified: Math.floor(stat.mtimeMs),
      value: { type, length: contents.length, contents: Buffer.from(contents) }
    })
  }

  let boundary = findBoundary(record.headers, record.key)
  if (boundary && !hasMetaSegment(boundary.fileKey)) {
    let schema = schemaFor(boundary.fileKey)
    let decoded = decodeFile(boundary.filePath, schema)
    if (decoded !== null) {
      let value = navigateObject(decoded, boundary.remaining)
      if (value !== undefined) {
        return result(record, inFileNode(record, boundary, value))
      }
    }
  }

  return withContext(record, [
    contextHeader('spl.error', 'get: not found — ' + record.key)
  ])
}

function result (record, node) {
  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: node,
    headers: [...record.headers, contextHeader('spl.status', 'completed')]
  }
}
