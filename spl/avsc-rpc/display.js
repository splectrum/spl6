const { Buffer } = require('spl/mycelium/runtime')
const { StreamRecord, NodeRecord, loadSchema } = require('spl/mycelium/schema')

// Human-readable display for stream records.
// Client/debugging concern — not part of the fabric.
//
// Tries to decode packed bytes using known schemas.
// Falls back to string/JSON, then raw bytes summary.

const decoder = new TextDecoder()

function str (val) {
  if (typeof val === 'string') return val
  if (val instanceof Uint8Array) return decoder.decode(val)
  return '' + val
}

// Try to decode bytes as a known schema
function tryDecode (key, bytes) {
  try {
    let schema = loadSchema(key)
    let decoded = schema.fromBuffer(bytes)
    return readableValue(decoded)
  } catch (e) {
    return null
  }
}

function readableValue (val) {
  if (val === null || val === undefined) return null
  if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
    let s = str(val)
    try { return JSON.parse(s) } catch (e) { return s }
  }
  if (Array.isArray(val)) return val.map(readableValue)
  if (typeof val === 'object') {
    let out = {}
    for (let k of Object.keys(val)) out[k] = readableValue(val[k])
    return out
  }
  return val
}

function readableHeader (entry) {
  // Stream descriptor — already resolved
  if (entry.key === 'spl.data.stream') {
    return { key: entry.key, value: readableValue(entry.value) }
  }

  // Packed bytes — try schema decode by key name
  if (Buffer.isBuffer(entry.value) || entry.value instanceof Uint8Array) {
    let decoded = tryDecode(entry.key, entry.value)
    if (decoded) return { key: entry.key, value: decoded }
    // Fall back to string
    return { key: entry.key, value: readableValue(entry.value) }
  }

  // Already unpacked
  return { key: entry.key, value: readableValue(entry.value) }
}

function readableContent (msg) {
  if (!msg.value || msg.value.length === 0) return null

  // Try as inner stream record (the onion)
  try {
    return nested(StreamRecord.fromBuffer(msg.value))
  } catch (e) { /* not a stream record */ }

  // Try response type header if available
  if (msg.headers) {
    let typeEntry = msg.headers.find(h => h.key === 'spl.data.response.type')
    if (typeEntry) {
      let typeName = Buffer.isBuffer(typeEntry.value)
        ? str(typeEntry.value) : String(typeEntry.value)
      let decoded = tryDecode(typeName, msg.value)
      if (decoded) return decoded
    }
  }

  // Try as node record (rawuri response)
  try {
    return readableValue(NodeRecord.fromBuffer(msg.value))
  } catch (e) { /* not a node record */ }

  // Try as text/JSON
  let s = str(msg.value)
  try { return JSON.parse(s) } catch (e) { return s }
}

function readable (msg) {
  return {
    offset: msg.offset,
    timestamp: msg.timestamp,
    key: msg.key,
    value: readableContent(msg),
    headers: msg.headers.map(readableHeader)
  }
}

function nested (msg) {
  return readable(msg)
}

module.exports = { readable, nested }
