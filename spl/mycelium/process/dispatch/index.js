const path = require('bare-path')
const { getStreamDescriptor, contextHeader } = require('spl/mycelium/schema')
const { repoRoot } = require('spl/mycelium/resolve')

// spl.mycelium.process.dispatch
//
// Read the stream descriptor, resolve the handler from
// the namespace path, run it. Contract: handler(record) → record.
//
// Handler resolution: spl.mycelium.process.execute
//   → strip 'spl.' → mycelium/process/execute
//   → require from repo root → index.js
//
// No registration. The namespace IS the path.
// Failure to require = no handler = error on the record.

const handlerCache = {}
let root = null

function getRoot () {
  if (root) return root
  root = repoRoot(typeof Bare !== 'undefined'
    ? require('bare-os').cwd()
    : process.cwd())
  return root
}

function resolveHandler (streamType) {
  if (handlerCache[streamType]) return handlerCache[streamType]

  let parts = streamType.split('.')
  let modulePath = path.join(getRoot(), ...parts)

  try {
    let handler = require(modulePath)
    if (typeof handler === 'function') {
      handlerCache[streamType] = handler
      return handler
    }
    return null
  } catch (e) {
    return null
  }
}

function dispatch (record) {
  let desc = getStreamDescriptor(record.headers)
  if (!desc) {
    return withContext(record, [
      contextHeader('spl.error', 'no spl.data.stream descriptor')
    ])
  }

  let handler = resolveHandler(desc.type)
  if (!handler) {
    return withContext(record, [
      contextHeader('spl.error', 'no handler for ' + desc.type)
    ])
  }

  return handler(record)
}

function withContext (record, extra) {
  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: record.value,
    headers: [...record.headers, ...extra]
  }
}

module.exports = { dispatch, withContext }
