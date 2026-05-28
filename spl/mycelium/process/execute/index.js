const { Buffer } = require('spl/mycelium/runtime')
const { StreamRecord, ExecuteContext, NodeRecord, contextHeader, findHeader, loadSchema } = require('spl/mycelium/schema')
const { dispatch, withContext } = require('spl/mycelium/process/dispatch')

const RESPONSE_TYPE_KEY = 'spl.data.response.type'

// Pack a value for boundary crossing.
// If the handler set a response type header, use that schema.
// Otherwise try NodeRecord. Buffers pass through.
function packValue (val, headers) {
  if (val === null || val === undefined) return Buffer.alloc(0)
  if (Buffer.isBuffer(val) || val instanceof Uint8Array) return val

  let typeEntry = findHeader(headers, RESPONSE_TYPE_KEY)
  if (typeEntry) {
    let typeName = Buffer.isBuffer(typeEntry.value)
      ? typeEntry.value.toString() : String(typeEntry.value)
    try {
      let schema = loadSchema(typeName)
      return schema.toBuffer(val)
    } catch (e) { /* fall through */ }
  }

  try { return NodeRecord.toBuffer(val) }
  catch (e) { return Buffer.alloc(0) }
}

// spl.mycelium.process.execute
//
// Execution context. Peels the onion, unpacks the
// execution context, dispatches the inner record,
// packs the result back for the boundary.
//
// Inside the process, header values are plain objects.
// Packing happens at boundary crossings only.

const EXEC_KEY = 'spl.mycelium.process.execute'

function execute (record) {
  if (!record.value || record.value.length === 0) {
    return withContext(record, [
      contextHeader('spl.error', 'execute: no inner record in value')
    ])
  }

  // Peel: deserialise inner record from value
  let inner
  try {
    inner = StreamRecord.fromBuffer(record.value)
  } catch (e) {
    return withContext(record, [
      contextHeader('spl.error', 'execute: value is not a stream record')
    ])
  }

  // Unpack execution context
  let execEntry = findHeader(record.headers, EXEC_KEY)
  let ctx = null
  if (execEntry) {
    try { ctx = ExecuteContext.fromBuffer(execEntry.value) }
    catch (e) { /* already unpacked or invalid */ }
    if (!ctx && typeof execEntry.value === 'object') ctx = execEntry.value
  }

  // Propagate unpacked context to inner record
  if (ctx) {
    inner = {
      offset: inner.offset,
      timestamp: inner.timestamp,
      key: inner.key,
      value: inner.value,
      headers: [...inner.headers, { key: EXEC_KEY, value: ctx }]
    }
  }

  let result = dispatch(inner)

  // Pack for boundary crossing
  let packedValue = packValue(result.value, result.headers)
  let packedHeaders = result.headers.map(h => {
    if (h.key === EXEC_KEY && typeof h.value === 'object' && !Buffer.isBuffer(h.value)) {
      return { key: h.key, value: ExecuteContext.toBuffer(h.value) }
    }
    return h
  })

  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: StreamRecord.toBuffer({
      offset: result.offset,
      timestamp: result.timestamp,
      key: result.key,
      value: packedValue,
      headers: packedHeaders
    }),
    headers: [
      ...record.headers,
      contextHeader('spl.status', 'executed')
    ]
  }
}

module.exports = execute
